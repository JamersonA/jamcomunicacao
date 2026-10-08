'use client';

import { Sparkles } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { telaLeve } from '@/lib/tokens';

export type AlvoLuz = MutableRefObject<{ x: number; y: number }>;
export type CoresCena = { luz: string; ouro: string; pico: string };
type Props = {
  alvo: AlvoLuz;
  ativo: boolean;
  cores: CoresCena;
  poeira: number;
  aoFlash: (intensidade: number) => void;
};

// Feixe volumétrico: cone aditivo cuja luz cai com a distância da fonte e se adensa no eixo,
// com poeira em suspensão (ruído que corre ao longo do feixe) e o reforço do flash.
const vertice = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vLocal;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vLocal = position;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const fragmento = /* glsl */ `
  uniform vec3 uCor;
  uniform vec3 uPico;
  uniform float uTempo;
  uniform float uFlash;
  uniform float uAlcance;
  varying vec3 vNormal;
  varying vec3 vLocal;
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float ruido(vec2 p) {
    vec2 i = floor(p); vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }
  void main() {
    float d = clamp(vLocal.z / uAlcance, 0.0, 1.0);
    float queda = pow(1.0 - d, 1.6);
    vec3 n = vec3(vNormal.x, vNormal.y, abs(vNormal.z));
    float eixo = pow(clamp(n.z, 0.0, 1.0), 2.2);
    float ang = atan(vLocal.y, vLocal.x);
    float poeira = ruido(vec2(ang * 3.0, vLocal.z * 1.4 - uTempo * 0.35));
    float faixas = 0.75 + 0.25 * ruido(vec2(ang * 9.0 + uTempo * 0.08, 0.5));
    float i = queda * eixo * faixas * (0.6 + 0.4 * poeira) * (0.55 + uFlash * 1.6);
    vec3 cor = mix(uCor, uPico, clamp(eixo * (1.0 - d) + uFlash * 0.6, 0.0, 1.0));
    gl_FragColor = vec4(cor * i, i);
  }
`;

const ALCANCE = 11;
const FONTE = new THREE.Vector3(3.6, 3.4, -1.5);

function Feixe({ alvo, cores, flash }: { alvo: AlvoLuz; cores: CoresCena; flash: MutableRefObject<number> }) {
  const malha = useRef<THREE.Mesh>(null);
  const mira = useMemo(() => new THREE.Vector3(), []);
  const geometria = useMemo(() => {
    const g = new THREE.ConeGeometry(2.4, ALCANCE, 96, 24, true);
    g.translate(0, -ALCANCE / 2, 0);
    g.rotateX(-Math.PI / 2);
    return g;
  }, []);
  const material = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: vertice,
    fragmentShader: fragmento,
    uniforms: {
      uCor: { value: new THREE.Color(cores.ouro) },
      uPico: { value: new THREE.Color(cores.pico) },
      uTempo: { value: 0 },
      uFlash: { value: 0 },
      uAlcance: { value: ALCANCE },
    },
    transparent: true,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
  }), [cores]);

  useFrame((estado) => {
    const m = malha.current;
    if (!m) return;
    mira.set((alvo.current.x - 0.5) * 7, (0.5 - alvo.current.y) * 4.5, 0.5);
    m.lookAt(mira);
    material.uniforms.uTempo.value = estado.clock.elapsedTime;
    material.uniforms.uFlash.value = flash.current;
  });

  return <mesh ref={malha} position={FONTE} geometry={geometria} material={material} />;
}

// Fonte da luz: o "refletor" visto de frente, um ponto quente que pulsa e explode no flash.
function Fonte({ cores, flash }: { cores: CoresCena; flash: MutableRefObject<number> }) {
  const sprite = useRef<THREE.Sprite>(null);
  const textura = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, cores.pico);
    g.addColorStop(0.25, cores.ouro);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, [cores]);
  useFrame((estado) => {
    const s = sprite.current;
    if (!s) return;
    const respiro = 1 + Math.sin(estado.clock.elapsedTime * 1.3) * 0.06;
    const k = (1.6 + flash.current * 2.4) * respiro;
    s.scale.set(k, k, 1);
    (s.material as THREE.SpriteMaterial).opacity = 0.55 + flash.current * 0.45;
  });
  return (
    <sprite ref={sprite} position={FONTE}>
      <spriteMaterial map={textura} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  );
}

// Câmera com inércia atrás do cursor e o relógio dos flashes (intervalo e força aleatórios).
function Direcao({ alvo, flash, aoFlash }: { alvo: AlvoLuz; flash: MutableRefObject<number>; aoFlash: (v: number) => void }) {
  const camera = useThree((s) => s.camera);
  const proximo = useRef(2 + Math.random() * 3);
  const forca = useRef(1);
  const enviado = useRef(0);
  useFrame((estado, dt) => {
    const t = estado.clock.elapsedTime;
    camera.position.x += ((alvo.current.x - 0.5) * 0.9 - camera.position.x) * 0.04;
    camera.position.y += ((0.5 - alvo.current.y) * 0.5 - camera.position.y) * 0.04;
    camera.lookAt(0, 0, 0);
    if (t > proximo.current) {
      forca.current = 0.55 + Math.random() * 0.45;
      flash.current = forca.current;
      proximo.current = t + 3 + Math.random() * 6;
    }
    flash.current *= Math.exp(-dt * 5.5);
    if (flash.current < 0.002) flash.current = 0;
    if (Math.abs(flash.current - enviado.current) > 0.01 || (flash.current === 0 && enviado.current !== 0)) {
      enviado.current = flash.current;
      aoFlash(flash.current);
    }
  });
  return null;
}

// Com a cena parada (pausa, movimento reduzido), desenha um quadro para a luz não sumir.
function QuadroParado({ ativo }: { ativo: boolean }) {
  const avancar = useThree((s) => s.advance);
  useEffect(() => {
    if (ativo) return;
    const id = requestAnimationFrame(() => avancar(performance.now()));
    return () => cancelAnimationFrame(id);
  }, [ativo, avancar]);
  return null;
}

export default function HeroCena({ alvo, ativo, cores, poeira, aoFlash }: Props) {
  const flash = useRef(0);
  const [leve] = useState(telaLeve);
  return (
    <Canvas
      className="hero__canvas"
      frameloop={ativo ? 'always' : 'never'}
      dpr={leve ? 1 : [1, 1.5]}
      gl={{ alpha: true, antialias: false, powerPreference: 'high-performance' }}
      // Sem a checagem síncrona do link do shader: o navegador compila sem travar a thread principal
      onCreated={({ gl }) => { gl.debug.checkShaderErrors = false; }}
      camera={{ fov: 42, position: [0, 0, 7] }}
      aria-hidden="true"
    >
      <Feixe alvo={alvo} cores={cores} flash={flash} />
      <Fonte cores={cores} flash={flash} />
      {poeira > 0 && (
        <>
          <Sparkles count={poeira} scale={[12, 7, 5]} size={2.6} speed={0.3} opacity={0.85} color={cores.ouro} noise={1.2} />
          <Sparkles count={Math.round(poeira / 3)} scale={[6, 4, 3]} position={[1.5, 0.8, 1.5]} size={5} speed={0.18} opacity={0.6} color={cores.pico} noise={0.6} />
        </>
      )}
      <Direcao alvo={alvo} flash={flash} aoFlash={aoFlash} />
      <QuadroParado ativo={ativo} />
    </Canvas>
  );
}

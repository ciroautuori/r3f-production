import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import type { Mesh } from "three";

// A deliberately simple scene: one floating icosahedron and a ground grid.
// The point is the governance shell around it, not the art direction.
export function HeroScene() {
  const mesh = useRef<Mesh>(null);

  useFrame((_, dt) => {
    if (mesh.current) {
      mesh.current.rotation.y += dt * 0.4;
      mesh.current.rotation.x += dt * 0.12;
    }
  });

  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[3, 5, 2]} intensity={1.2} />
      <Float speed={2} rotationIntensity={0.4} floatIntensity={1.2}>
        <mesh ref={mesh}>
          <icosahedronGeometry args={[1.2, 0]} />
          <meshStandardMaterial color="#7c3aed" metalness={0.3} roughness={0.25} />
        </mesh>
      </Float>

      {/* Ground grid for spatial reference. */}
      <gridHelper args={[24, 24, 0x303040, 0x202028]} position={[0, -2, 0]} />
    </>
  );
}

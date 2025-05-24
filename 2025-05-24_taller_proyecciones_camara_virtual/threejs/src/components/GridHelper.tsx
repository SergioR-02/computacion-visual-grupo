import { Grid } from '@react-three/drei';

export function GridHelper() {
  return (
    <>
      {/* Grid principal */}
      <Grid
        args={[20, 20]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#444444"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#666666"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
        infiniteGrid={false}
        position={[0, -2, 0]}
      />

      {/* Ejes de referencia */}
      <axesHelper args={[5]} />
    </>
  );
}

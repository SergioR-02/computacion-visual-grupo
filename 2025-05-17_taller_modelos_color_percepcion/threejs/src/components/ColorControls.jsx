import { useControls } from "leva";
import { useEffect } from "react";

export default function ColorControls({ onColorChange, onFilterChange, onTextureChange }) {
  const { color, filter, texture } = useControls({
    color: "#00aaff",
    filter: {
      options: {
        Ninguno: 0,
        Daltonismo: 1,
        EscalaGrises: 2
      }
    },
    texture: {
      options: {
        Ninguna: "none",
        UV: "https://threejs.org/examples/textures/uv_grid_opengl.jpg",
        Checker: "https://threejs.org/examples/textures/checker.png",
        Wood: "https://threejs.org/examples/textures/brick_diffuse.jpg"
      }
    }
  });

  useEffect(() => {
    onColorChange(color);
    onFilterChange(filter);
    onTextureChange(texture);
  }, [color, filter, texture]);

  return null;
}

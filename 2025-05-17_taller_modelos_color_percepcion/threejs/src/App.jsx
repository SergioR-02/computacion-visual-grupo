import { useState } from "react";
import SceneCanvas from "./components/SceneCanvas";
import ColorControls from "./components/ColorControls";

export default function App() {
  const [color, setColor] = useState("#00aaff");
  const [filter, setFilter] = useState(0);
  const [texture, setTexture] = useState("none");

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ColorControls
        onColorChange={setColor}
        onFilterChange={setFilter}
        onTextureChange={setTexture}
      />
      <SceneCanvas color={color} filter={filter} textureURL={texture} />
    </div>
  );
}

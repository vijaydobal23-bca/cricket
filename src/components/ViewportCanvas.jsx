// ============================================================================
// 3D WEBGL VIEWPORT CANVAS
// ============================================================================

export default function ViewportCanvas({ mountRef, onClick }) {
  return (
    <div
      ref={mountRef}
      onClick={onClick}
      className="w-full h-full cursor-crosshair"
    />
  );
}

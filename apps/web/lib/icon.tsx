import { ImageResponse } from "next/og";

/** The app icon: a white "S" on the brand green. Full-bleed, so it also works as a maskable icon. */
export function renderIcon(size: number) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f8a68",
          color: "white",
          fontSize: size * 0.62,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        S
      </div>
    ),
    { width: size, height: size },
  );
}

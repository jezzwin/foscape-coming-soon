import { backgroundConfig } from "@/lib/site";
import { PondVideo } from "./PondVideo";

export function PondBackground() {
  // Image mode stays a server-rendered still, so it ships no client JS at all.
  if (backgroundConfig.mode === "image") {
    return (
      <div className="pond pond--image">
        <div className="pond__still" />
      </div>
    );
  }

  return <PondVideo />;
}

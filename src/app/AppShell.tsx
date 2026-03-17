import { RuntimeSurface } from "../game/render/RuntimeSurface";
import { appConfig } from "../shared/config/appConfig";

export function AppShell() {
  return (
    <main className="app-shell" data-app-ready="true">
      <section className="app-shell__runtime" aria-label="Interactive runtime shell">
        <RuntimeSurface />
      </section>

      <section className="app-shell__overlay" aria-label="Shell status overlay">
        <div className="shell-identity">
          <p className="shell-identity__eyebrow">Static runtime foundation</p>
          <h1>{appConfig.name}</h1>
          <p className="shell-identity__body">
            React owns the shell, Pixi owns the world surface, and the first playable loop
            will land on top of this fullscreen-ready scaffold.
          </p>
        </div>

        <dl className="shell-status">
          <div>
            <dt>Renderer</dt>
            <dd>PixiJS via @pixi/react</dd>
          </div>
          <div>
            <dt>Runtime</dt>
            <dd>Static PWA shell</dd>
          </div>
          <div>
            <dt>Target</dt>
            <dd>{appConfig.logicalWidth}px logical width baseline</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}

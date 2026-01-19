from datetime import datetime
from fasthtml.common import *

app, rt = fast_app()

@rt('/')
def get():
    current_year = datetime.now().year

    return Html(
        Head(
            Title("Henry S. Winter Project"),
            Style("""
                       * {
                           margin: 0;
                           padding: 0;
                           box-sizing: border-box;
                       }

                       body {
                           background-color: #2d5016;
                           font-family: system-ui, -apple-system, sans-serif;
                           height: 100vh;
                           display: flex;
                           flex-direction: column;
                       }

                       .button-bar {
                           display: flex;
                           gap: 10px;
                           justify-content: center;
                           padding: 15px;
                           background-color: #1a3009;
                           box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                       }

                       .game-button {
                           background-color: #d4af37;
                           color: #1a3009;
                           border: none;
                           padding: 12px 24px;
                           font-size: 16px;
                           font-weight: 600;
                           cursor: pointer;
                           border-radius: 6px;
                           transition: all 0.2s;
                       }

                       .game-button:hover {
                           background-color: #f0c959;
                           transform: translateY(-2px);
                       }

                       .game-button.active {
                           background-color: #d4af37;
                           outline: 2px solid #f0c959;
                           outline-offset: 2px;
                       }

                       .footer {
                           background-color: #1a3009;
                           color: white;
                           text-align: center;
                           padding: 15px;
                           font-size: 14px;
                       }

                       .canvas-container {
                           flex: 1;
                           display: flex;
                           justify-content: center;
                           align-items: center;
                           padding: 20px;
                           min-height: 400px;
                       }

                       #game-canvas {
                           background-color: #1a3009;
                           border: 3px solid #d4af37;
                           border-radius: 4px;
                           max-width: 100%;
                           max-height: 100%;
                       }

                       @media (max-width: 768px) {
                           .button-bar {
                               flex-wrap: wrap;
                           }

                           .game-button {
                               padding: 10px 20px;
                               font-size: 14px;
                           }
                       }
                   """),
            Meta(name="viewport", content="width=device-width, initial-scale=1.0"),
        ),
        Body(
            Div(
                Button("Blocks", cls="game-button active", onclick="loadGame('blocks')"),
                Button("Snake", cls="game-button", onclick="loadGame('snake')"),
                cls="button-bar"
            ),
            Div(
                Canvas(id="game-canvas", width="800", height="600"),
                cls="canvas-container"
            ),
            Div(
                P("Henry S."),
                P(f"Copyright (c) {current_year}"),
                cls="footer"
            ),
            Script("""
                function loadGame(gameName) {
                    // Update active button
                    document.querySelectorAll('.game-button').forEach(btn => {
                        btn.classList.remove('active');
                    });
                    event.target.classList.add('active');

                    // Load game module (to be implemented)
                    console.log('Loading game:', gameName);

                    // Future: import(`/games/${gameName}.js`).then(game => game.init());
                }

                // Responsive canvas sizing
                function resizeCanvas() {
                    const canvas = document.getElementById('game-canvas');
                    const container = canvas.parentElement;
                    const maxWidth = 1200;
                    const maxHeight = 800;
                    const minWidth = 320;
                    const minHeight = 240;

                    let width = container.clientWidth - 40;
                    let height = container.clientHeight - 40;

                    width = Math.min(Math.max(width, minWidth), maxWidth);
                    height = Math.min(Math.max(height, minHeight), maxHeight);

                    canvas.style.width = width + 'px';
                    canvas.style.height = height + 'px';
                }

                window.addEventListener('resize', resizeCanvas);
                resizeCanvas();
            """)
        )
    )

serve()

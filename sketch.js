let bucketColor;
let previousBucketColor; // Variable für die vorherige Farbe des Eimers
let ballColors = ["#FF00FF", "#33FF33", "#0099FF", "#FFFF00"]; // Neonfarben: Neon-Grün ist jetzt #33FF33
let score = 0;
let lives = 3;
let ballSpawnInterval = 2000; // Zeitintervall zum Spawnen neuer Bälle (in Millisekunden)
let lastBallSpawnTime = 0;    // Zeitpunkt des letzten Ballspawns
let timerStartTime;          // Startzeit des Timers
let gameTime = 0;            // Zeit in Sekunden
let ballSpacing = 80;        // Abstand zwischen den Bällen
let baseBallSpeed = 3;       // Grundgeschwindigkeit der Bälle
let speedIncreaseInterval = 8000; // Zeitintervall für Geschwindigkeitserhöhung (in Millisekunden)
let lastSpeedIncreaseTime = 0;    // Zeitpunkt der letzten Geschwindigkeitserhöhung
let initialBallCount = 3;    // Anfangszahl der Bälle
let maxBallCount = 10;       // Maximale Anzahl der Bälle, die im Spiel sein können

// Zustände für das Spiel
let gameState;
const START_MENU = 0;
const GAME_PLAY = 1;

let highScore = 0;
let highScoreTime = 0;
let lastGameScore = 0;
let lastGameTime = 0;

let menuTextColors = ["#FFFFFF", "#FFCC00", "#FF66CC", "#33FF33", "#FF3333", "#33FFFF", "#FF9900", "#CC00FF", "#00CC99", "#FF6600"]; // Gut sichtbare Farben für die Schrift
let menuTextColor; // Variable für die Schriftfarbe des Hauptmenüs

function setup() {
  createCanvas(windowWidth, windowHeight); // Canvas auf die Fenstergröße setzen
  gameState = START_MENU; // Starte mit dem Hauptmenü

  // Setze eine zufällige Farbe aus der Liste für die Schrift
  menuTextColor = color(random(menuTextColors));

  // Lade den High Score aus dem lokalen Speicher
  let storedHighScore = localStorage.getItem('highScore');
  let storedHighScoreTime = localStorage.getItem('highScoreTime');
  if (storedHighScore !== null) {
    highScore = parseInt(storedHighScore);
    highScoreTime = parseInt(storedHighScoreTime);
  }
}

function draw() {
  if (gameState === START_MENU) {
    drawStartMenu();
  } else if (gameState === GAME_PLAY) {
    gamePlay();
  }
}

// Funktion zum Zeichnen des Hauptmenüs
function drawStartMenu() {
  background(0); // Hintergrund auf schwarz setzen

  textSize(height / 15); // Größere Textgröße für den Haupttitel
  fill(menuTextColor); // Zufällige Schriftfarbe aus der Liste
  textAlign(CENTER, CENTER);
  text('Main Menu', width / 2, height / 6); // Titel weiter oben

  // High Score anzeigen
  textSize(height / 25); // Größere Textgröße für die High Score-Anzeige
  fill(menuTextColor); // Zufällige Schriftfarbe aus der Liste
  textAlign(CENTER, CENTER);
  text('Best Round:', width / 2, height / 3-20);
  text('Score: ' + highScore, width / 2, height / 2.5-30);
  text('Time: ' + formatTime(highScoreTime), width / 2, height / 2.3-20);

  // Letztes Spiel anzeigen
  textSize(height / 30); // Kleinere Textgröße für das letzte Spiel
  fill(menuTextColor); // Zufällige Schriftfarbe aus der Liste
  textAlign(CENTER, CENTER);
  text('Last Game:', width / 2, height / 2.0+10);
  text('Score: ' + lastGameScore, width / 2, height / 1.9+25);
  text('Time: ' + formatTime(lastGameTime), width / 2, height / 1.8+35);

  // Startknopf zeichnen
  fill(255, 0, 0);
  rect(width / 2 - width / 8, height / 1.5, width / 4, height / 20); // Button zeichnen

  fill(255);
  textSize(height / 30);
  text('Start', width / 2, height / 1.5 + height / 40); // Text auf dem Button
}

// Funktion für Maus-Klicks und Touch-Eingaben
function mousePressed() {
  if (gameState === START_MENU) {
    // Überprüfe, ob der Startknopf gedrückt wurde
    if (mouseX > width / 2 - width / 8 && mouseX < width / 2 + width / 8 &&
        mouseY > height / 1.5 && mouseY < height / 1.5 + height / 20) {
      gameState = GAME_PLAY; // Wechsle zum Spielzustand
      setupGame(); // Initialisiere das Spiel
    }
  }
}

function touchStarted() {
  if (gameState === START_MENU) {
    // Überprüfe, ob der Startknopf gedrückt wurde
    if (mouseX > width / 2 - width / 8 && mouseX < width / 2 + width / 8 &&
        mouseY > height / 1.5 && mouseY < height / 1.5 + height / 20) {
      gameState = GAME_PLAY; // Wechsle zum Spielzustand
      setupGame(); // Initialisiere das Spiel
    }
  } else if (gameState === GAME_PLAY) {
    bucket.handleTouchStart(mouseX, mouseY);
  }
  return false; // Verhindere, dass der Browser den Touch-Event als Scrollen interpretiert
}

// Funktion für Maus- und Touch-Bewegungen
function touchMoved() {
  if (gameState === GAME_PLAY) {
    bucket.move();
    return false; // Verhindere, dass der Browser die Touch-Bewegung als Scrollen interpretiert
  }
}

function mouseDragged() {
  if (gameState === GAME_PLAY) {
    bucket.move();
  }
}

// Funktion zum Initialisieren des Spiels
function setupGame() {
  bucket = new Bucket();
  balls = [];
  score = 0;
  lives = 3;
  bucketColor = random(ballColors);
  previousBucketColor = null;
  baseBallSpeed = 3;
  lastBallSpawnTime = millis();
  lastSpeedIncreaseTime = millis();
  resetTimer();
  spawnBalls(initialBallCount);
}

// Funktion für das Gameplay
function gamePlay() {
  background(0); // Hintergrund auf schwarz setzen

  // Update und Anzeige des Timers
  if (lives > 0) {
    gameTime = Math.floor((millis() - timerStartTime) / 1000);
  }
  
  // Timer oben in der Mitte anzeigen
  textSize(height / 25);
  fill(255); // Weiße Schriftfarbe für das Gameplay
  textAlign(CENTER, TOP);
  text('Time: ' + formatTime(gameTime), width / 2, height / 30);
  
  // Score in der oberen rechten Ecke anzeigen
  textSize(height / 25);
  fill(255); // Weiße Schriftfarbe für das Gameplay
  textAlign(RIGHT, TOP);
  text("Score: " + score, width - 20, height / 30);

  // Leben in der oberen linken Ecke anzeigen
  textSize(height / 25);
  fill(255); // Weiße Schriftfarbe für das Gameplay
  textAlign(LEFT, TOP);
  text("Lives: " + lives, 20, height / 30);

  // Eimer bewegen und anzeigen
  bucket.move();
  bucket.display();

  // Überprüfen, ob es Zeit ist, neue Bälle zu spawnen
  if (millis() - lastBallSpawnTime > ballSpawnInterval) {
    spawnBalls(getCurrentBallCount()); // Spawn neuer Bälle basierend auf der aktuellen Anzahl
    lastBallSpawnTime = millis(); // Zeit des letzten Spawns aktualisieren
  }

for (let i = balls.length - 1; i >= 0; i--) {
  if (balls[i]) { // Überprüfen, ob der Ball definiert ist
    balls[i].move();
    balls[i].display();

    // Überprüfen, ob der Ball vom Eimer gefangen wurde
    if (bucket && balls[i].caughtBy(bucket)) { // Überprüfen, ob der Eimer definiert ist
      if (balls[i].color === bucketColor) {
        // Score erhöhen, wenn die Farbe des Balls mit der des Eimers übereinstimmt
        score++;
        previousBucketColor = bucketColor; // Speichern der vorherigen Farbe
        // Wähle eine neue Farbe für den Eimer, die nicht die gleiche wie vorher ist
        do {
          bucketColor = random(ballColors);
        } while (bucketColor === previousBucketColor);
      } else {
        // Leben verringern, wenn die Farbe des Balls nicht mit der des Eimers übereinstimmt
        lives--;
      }

      // Ball nach dem Fangen entfernen
      balls.splice(i, 1);
    }

    // Ball verlässt den Bildschirm
    if (balls[i] && balls[i].y > height) {
      balls.splice(i, 1);  // Ball wird entfernt, wenn er den Bildschirm verlässt
    }

    // Wenn Leben 0 erreichen, das Spiel zurücksetzen
    if (lives <= 0) {
      saveHighScore(); // Hier wird die Funktion aufgerufen
      lastGameScore = score;
      lastGameTime = gameTime;
      resetGame();
      gameState = START_MENU; // Nach dem Zurücksetzen zum Hauptmenü wechseln
    }
  }
}

  // Überprüfen, ob es Zeit ist, die Geschwindigkeit der Bälle zu erhöhen
  if (millis() - lastSpeedIncreaseTime > speedIncreaseInterval) {
    increaseBallSpeed();
    lastSpeedIncreaseTime = millis(); // Zeit der letzten Geschwindigkeitserhöhung aktualisieren
  }
}

// Funktion zum Speichern des High Scores
function saveHighScore() {
  if (score > highScore) {
    highScore = score;
    highScoreTime = gameTime;
    localStorage.setItem('highScore', highScore);
    localStorage.setItem('highScoreTime', highScoreTime);
  }
}

// Funktion zum Spawnen neuer Bälle
function spawnBalls(numBalls) {
  let startY = -50; // Bälle starten etwas weiter oben außerhalb des Bildschirms
  let minBallSpacingY = height / 4; // Mindestabstand zwischen den Bällen in Y-Richtung
  let minBallSpacingX = ballSpacing; // Mindestabstand zwischen den Bällen in X-Richtung
  let hasBucketColorBall = false;

  // Array für die Bälle mit ihren Positionen
  let ballsWithPositions = [];

  for (let i = 0; i < numBalls; i++) {
    let ballX, ballY;
    let validPosition = false;

    // Versuche, für jeden Ball eine gültige Position zu finden
    while (!validPosition) {
      // Wähle eine zufällige X-Position für den Ball
      ballX = random(20, width - 20); // Berücksichtige die Ballgröße

      // Wähle eine zufällige Y-Position, die nicht auf der gleichen Höhe wie ein anderer Ball ist
      ballY = startY - (i * minBallSpacingY); // Verteile die Bälle vertikal

      validPosition = true;

      // Überprüfe, ob der Ball sich nicht mit anderen Bällen überlappt
      for (let pos of ballsWithPositions) {
        let dX = abs(ballX - pos.x); // Berechne den Abstand in X-Richtung
        let dY = abs(ballY - pos.y); // Berechne den Abstand in Y-Richtung

        if (dX < minBallSpacingX && dY < minBallSpacingY) {
          // Der Abstand muss groß genug sein, um keine Überlappung zu verursachen
          validPosition = false;
          break;
        }
      }
    }

    // Stelle sicher, dass der erste Ball die Farbe des Eimers hat
    let ballColor;
    if (i === 0) {
      ballColor = bucketColor;
      hasBucketColorBall = true;
    } else {
      // Stelle sicher, dass die anderen Bälle nicht die gleiche Farbe wie der Eimer haben
      do {
        ballColor = random(ballColors);
      } while (ballColor === bucketColor);
    }

    // Erstelle den Ball und füge ihn zur Liste hinzu
    let ball = new Ball(ballColor, ballX, ballY);
    ballsWithPositions.push({x: ballX, y: ballY}); // Speichere die Position, um Überlappungen zu vermeiden
    balls.push(ball); // Füge den Ball zur Liste der Bälle hinzu
  }
}




// Funktion zum Erhöhen der Geschwindigkeit der Bälle
function increaseBallSpeed() {
  baseBallSpeed *= 1.1; // Erhöhe die Basisgeschwindigkeit um 10% alle Intervalle
}

// Funktion zur Bestimmung der aktuellen Anzahl an Bällen
function getCurrentBallCount() {
  let numBalls = Math.min(initialBallCount + Math.floor(gameTime / 15), maxBallCount);
  return numBalls;
}

// Funktion zum Zurücksetzen des Spiels
function resetGame() {
  score = 0;
  lives = 3;
  balls = [];
  bucketColor = random(ballColors); // Eimerfarbe zurücksetzen
  previousBucketColor = null; // Vorherige Farbe zurücksetzen
  baseBallSpeed = 3; // Basisgeschwindigkeit zurücksetzen
  lastBallSpawnTime = millis(); // Zeit des letzten Spawns zurücksetzen
  lastSpeedIncreaseTime = millis(); // Zeit der letzten Geschwindigkeitserhöhung zurücksetzen
  resetTimer(); // Timer zurücksetzen
  spawnBalls(initialBallCount); // Den ersten Satz von Bällen nach dem Zurücksetzen spawnen
}

// Funktion zum Zurücksetzen des Timers
function resetTimer() {
  timerStartTime = millis(); // Timer starten
}

// Funktion zur Formatierung der Zeit als Minuten:Sekunden
function formatTime(seconds) {
  let minutes = Math.floor(seconds / 60);
  let secs = seconds % 60;
  return nf(minutes, 2) + ':' + nf(secs, 2);
}
// Ball-Klasse
class Ball {
  constructor(color, x, y) {
    this.x = x;
    this.y = y;
    this.size = height / 20; // Ballgröße proportional zur Höhe
    this.speed = 3; // Konstante Geschwindigkeit für alle Bälle
    this.color = color;
  }

  move() {
    this.y += this.speed;
  }

  display() {
    fill(this.color);
    ellipse(this.x, this.y, this.size);
  }

  // Überprüfen, ob der Ball vom Eimer gefangen wurde
  caughtBy(bucket) {
    return this.y + this.size / 2 >= bucket.y &&
           this.x > bucket.x &&
           this.x < bucket.x + bucket.width;
  }
}

// Bucket-Klasse
class Bucket {
  constructor() {
    this.width = width / 5; // Eimerbreite proportional zur Breite
    this.height = height / 20; // Eimerhöhe proportional zur Höhe
    this.x = width / 2 - this.width / 2;
    this.y = height - this.height - height / 40; // Eimer am unteren Rand positionieren
    this.isDragging = false; // Variable zum Überprüfen, ob der Eimer gerade gezogen wird
  }

  move() {
    if (gameState === GAME_PLAY) {
      if (keyIsDown(LEFT_ARROW)) {
        this.x -= width / 100; // Eimer bewegen proportional zur Breite
      } else if (keyIsDown(RIGHT_ARROW)) {
        this.x += width / 100; // Eimer bewegen proportional zur Breite
      }

      // Wenn der Eimer mit der Maus oder dem Finger bewegt wird
      if (this.isDragging) {
        this.x = mouseX - this.width / 2;
      }

      // Verhindern, dass der Eimer vom Bildschirm bewegt wird
      this.x = constrain(this.x, 0, width - this.width);
    }
  }

  display() {
    fill(bucketColor); // Aktuelle Farbe des Eimers
    rect(this.x, this.y, this.width, this.height);
  }

  // Überprüfe, ob der Eimer gedrückt wurde
  handleTouchStart(x, y) {
    if (x > this.x && x < this.x + this.width && y > this.y && y < this.y + this.height) {
      this.isDragging = true;
    }
  }

  // Überprüfe, ob das Ziehen des Eimers beendet wurde
  handleTouchEnd() {
    this.isDragging = false;
  }
}

// Event-Handler für Touch-Events
function touchStarted() {
  if (gameState === START_MENU) {
    if (mouseX > width / 2 - width / 8 && mouseX < width / 2 + width / 8 &&
        mouseY > height / 1.5 && mouseY < height / 1.5 + height / 20) {
      gameState = GAME_PLAY; // Wechsle zum Spielzustand
      setupGame(); // Initialisiere das Spiel
    }
  } else if (gameState === GAME_PLAY) {
    bucket.handleTouchStart(mouseX, mouseY);
  }
  return false; // Verhindere, dass der Browser den Touch-Event als Scrollen interpretiert
}

function touchEnded() {
  if (gameState === GAME_PLAY) {
    bucket.handleTouchEnd();
  }
  return false; // Verhindere, dass der Browser den Touch-Event als Scrollen interpretiert
}

function mouseDragged() {
  if (gameState === GAME_PLAY) {
    bucket.move();
  }
}

// Anpassung der Canvas-Größe bei Fenstergrößenänderung
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
} 
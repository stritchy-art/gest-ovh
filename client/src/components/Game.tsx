import { useState, useEffect, useRef } from 'react'

interface GameProps {
  onClose: () => void
}

export default function Game({ onClose }: GameProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('ovh-game-highscore')
    return saved ? parseInt(saved, 10) : 0
  })

  const [superModeActive, setSuperModeActive] = useState(false)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Dimensions
    const WIDTH = 800
    const HEIGHT = 300
    canvas.width = WIDTH
    canvas.height = HEIGHT

    // Enable image smoothing for better quality
    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    // Load player image
    const playerImage = new Image()
    playerImage.src = '/player-icon.png'
    let imageLoaded = false
    playerImage.onload = () => {
      imageLoaded = true
    }

    // Game state
    let animationId: number
    let currentScore = 0
    let isJumping = false
    let jumpVelocity = 0
    const gravity = 0.6
    const jumpPower = -12
    let isSuperMode = false
    let glowPulse = 0

    // Player (OVH Cloud)
    const player = {
      x: 50,
      y: HEIGHT - 90,
      width: 60,
      height: 60,
      baseY: HEIGHT - 90
    }

    // Obstacles
    const obstacles: Array<{ x: number; width: number; height: number; passed: boolean }> = []
    let obstacleSpeed = 7
    let obstacleTimer = 0
    const obstacleInterval = 80

    // Jump
    const jump = () => {
      if (!isJumping && player.y === player.baseY) {
        isJumping = true
        jumpVelocity = jumpPower
      }
    }

    // Keyboard
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault()
        jump()
      }
    }

    // Mouse/Touch
    const handleClick = () => jump()

    window.addEventListener('keydown', handleKeyDown)
    canvas.addEventListener('click', handleClick)

    // Spawn obstacle
    const spawnObstacle = () => {
      const height = 30 + Math.random() * 40
      obstacles.push({
        x: WIDTH,
        width: 20 + Math.random() * 30,
        height,
        passed: false
      })
    }

    // Game loop
    const gameLoop = () => {
      if (gameOver) return

      // Clear
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      // Ground
      ctx.fillStyle = '#334155'
      ctx.fillRect(0, HEIGHT - 30, WIDTH, 30)

      // Update player
      if (isJumping || player.y < player.baseY) {
        jumpVelocity += gravity
        player.y += jumpVelocity

        if (player.y >= player.baseY) {
          player.y = player.baseY
          isJumping = false
          jumpVelocity = 0
        }
      }

      // Draw player (character icon)
      if (imageLoaded) {
        // Super mode halo (quand on dépasse le high score)
        if (isSuperMode) {
          glowPulse += 0.1
          const pulseSize = Math.sin(glowPulse) * 5 + 10
          
          // Aura externe jaune dorée
          const gradient = ctx.createRadialGradient(
            player.x + player.width/2, 
            player.y + player.height/2, 
            player.width/2,
            player.x + player.width/2, 
            player.y + player.height/2, 
            player.width/2 + pulseSize + 15
          )
          gradient.addColorStop(0, 'rgba(255, 215, 0, 0.6)')
          gradient.addColorStop(0.5, 'rgba(255, 215, 0, 0.3)')
          gradient.addColorStop(1, 'rgba(255, 215, 0, 0)')
          
          ctx.fillStyle = gradient
          ctx.beginPath()
          ctx.arc(
            player.x + player.width/2, 
            player.y + player.height/2, 
            player.width/2 + pulseSize + 15, 
            0, 
            Math.PI * 2
          )
          ctx.fill()
          
          // Particules d'aura
          for (let i = 0; i < 3; i++) {
            const angle = glowPulse + (i * Math.PI * 2 / 3)
            const particleX = player.x + player.width/2 + Math.cos(angle) * (player.width/2 + 10)
            const particleY = player.y + player.height/2 + Math.sin(angle) * (player.height/2 + 10)
            
            ctx.fillStyle = 'rgba(255, 215, 0, 0.8)'
            ctx.beginPath()
            ctx.arc(particleX, particleY, 3, 0, Math.PI * 2)
            ctx.fill()
          }
        }
        
        ctx.drawImage(playerImage, player.x, player.y, player.width, player.height)
      } else {
        // Fallback while image loads
        ctx.fillStyle = '#3b82f6'
        ctx.fillRect(player.x, player.y, player.width, player.height)
        ctx.fillStyle = '#ffffff'
        ctx.font = '30px Arial'
        ctx.fillText('☁️', player.x + 5, player.y + 30)
      }

      // Update obstacles
      obstacleTimer++
      if (obstacleTimer > obstacleInterval) {
        spawnObstacle()
        obstacleTimer = 0
      }

      for (let i = obstacles.length - 1; i >= 0; i--) {
        const obs = obstacles[i]
        obs.x -= obstacleSpeed

        // Draw obstacle (server rack style)
        const obsY = HEIGHT - 30 - obs.height
        ctx.fillStyle = '#ef4444'
        ctx.fillRect(obs.x, obsY, obs.width, obs.height)
        ctx.fillStyle = '#991b1b'
        for (let j = 0; j < obs.height; j += 10) {
          ctx.fillRect(obs.x + 2, obsY + j + 2, obs.width - 4, 6)
        }

        // Collision detection
        if (
          player.x < obs.x + obs.width &&
          player.x + player.width > obs.x &&
          player.y < obsY + obs.height &&
          player.y + player.height > obsY
        ) {
          setGameOver(true)
          if (currentScore > highScore) {
            setHighScore(currentScore)
            localStorage.setItem('ovh-game-highscore', currentScore.toString())
          }
          return
        }

        // Score
        if (!obs.passed && obs.x + obs.width < player.x) {
          obs.passed = true
          currentScore++
          setScore(currentScore)
          
          // Activer le mode super si on dépasse le high score
          if (currentScore > highScore && !isSuperMode) {
            isSuperMode = true
            setSuperModeActive(true)
          }
          
          // Speed up every 5 points
          if (currentScore % 5 === 0) {
            obstacleSpeed += 0.8
          }
        }

        // Remove off-screen obstacles
        if (obs.x + obs.width < 0) {
          obstacles.splice(i, 1)
        }
      }

      // Draw score
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 20px monospace'
      ctx.fillText(`Score: ${currentScore}`, 20, 30)
      ctx.fillText(`Best: ${highScore}`, 20, 55)

      // Draw instructions
      ctx.fillStyle = '#94a3b8'
      ctx.font = '14px monospace'
      ctx.fillText('SPACE / ↑ / CLICK to jump', WIDTH - 220, 30)

      animationId = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('keydown', handleKeyDown)
      canvas.removeEventListener('click', handleClick)
    }
  }, [gameOver, highScore])

  const restart = () => {
    setScore(0)
    setGameOver(false)
    setSuperModeActive(false)
  }

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
      <div className="modal-dialog modal-xl modal-dialog-centered">
        <div className="modal-content bg-dark text-white">
          <div className="modal-header border-secondary">
            <h5 className="modal-title d-flex align-items-center gap-2">
              <span style={{ fontSize: '1.5rem' }}>☁️</span>
              OVH Cloud Runner
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          
          <div className="modal-body p-0 position-relative">
            <canvas
              ref={canvasRef}
              className="w-100 d-block"
              style={{ backgroundColor: '#0f172a' }}
            />
            {/* Cartoon Super Saiyan mode visuel */}
            {superModeActive && !gameOver && (
              <div
                className="position-absolute top-0 start-50 translate-middle-x mt-4"
                style={{
                  zIndex: 10,
                  pointerEvents: 'none',
                  textShadow: '0 0 10px #fff700, 0 0 20px #ffec80',
                  fontFamily: 'Comic Sans MS, Comic Sans, cursive',
                  fontWeight: 'bold',
                  fontSize: '3rem',
                  color: '#ffe600',
                  WebkitTextStroke: '2px #ff9800',
                  filter: 'drop-shadow(0 0 10px #fff700) drop-shadow(0 0 20px #ffec80)'
                }}
              >
               Super Saiyan mode! 
              </div>
            )}
            {gameOver && (
              <div 
                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-center"
                style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}
              >
                <div className="text-center">
                  <h3 className="display-4 fw-bold mb-3">Game Over!</h3>
                  <p className="fs-2 text-primary mb-2">Score: {score}</p>
                  {score > 0 && score === highScore && (
                    <p className="fs-4 text-warning mb-4">🏆 New High Score!</p>
                  )}
                  <button
                    onClick={restart}
                    className="btn btn-primary btn-lg px-5"
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Play Again
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer border-secondary justify-content-center">
            <small className="text-muted">
              <i className="bi bi-keyboard me-1"></i>
              Jump over the server racks! Press <kbd>Alt+K</kbd> again to close.
            </small>
          </div>
        </div>
      </div>
    </div>
  )
}

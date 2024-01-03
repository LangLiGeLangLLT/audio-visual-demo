'use client'

import { useEffect, useRef } from 'react'

export default function Home() {
  const isInit = useRef<boolean>()
  const audioRef = useRef<HTMLAudioElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const ctx = useRef<CanvasRenderingContext2D | null>()
  const analyser = useRef<AnalyserNode>()
  const dataArray = useRef<Uint8Array>()

  const initCanvas = () => {
    if (!canvasRef.current) return

    ctx.current = canvasRef.current.getContext('2d')
    canvasRef.current.width = canvasRef.current.scrollWidth
    canvasRef.current.height = canvasRef.current.scrollHeight
  }

  const play = () => {
    if (isInit.current) return
    if (!audioRef?.current) return

    const audioCtx = new AudioContext() // 创建音频上下文
    const source = audioCtx.createMediaElementSource(audioRef.current) // 创建音频源节点
    analyser.current = audioCtx.createAnalyser()
    analyser.current.fftSize = 512
    // 创建数组，用于接收分析器节点的分析数据
    dataArray.current = new Uint8Array(analyser.current.frequencyBinCount)
    source.connect(analyser.current)
    analyser.current.connect(audioCtx.destination)

    isInit.current = true
  }

  const draw = () => {
    requestAnimationFrame(draw)

    if (
      !canvasRef.current ||
      !ctx.current ||
      !analyser.current ||
      !dataArray.current
    ) {
      return
    }

    // 清空画布
    const { width, height } = canvasRef.current
    ctx.current.clearRect(0, 0, width, height)

    if (!isInit.current) return
    // 让分析器节点分析出数据到数组中
    analyser.current.getByteFrequencyData(dataArray.current)
    const len = dataArray.current.length / 2.5
    const barWidth = width / len / 2
    ctx.current.fillStyle = '#0ea5e9'
    for (let i = 0; i < len; i++) {
      const data = dataArray.current[i]
      const barHeight = (data / 255) * height
      const x1 = width / 2 + i * barWidth
      const x2 = width / 2 - (i + 1) * barWidth
      const y = height - barHeight
      ctx.current.fillRect(x1, y, barWidth - 2, barHeight)
      ctx.current.fillRect(x2, y, barWidth - 2, barHeight)
    }
  }

  useEffect(() => {
    initCanvas()
    draw()
  }, [])

  return (
    <div className="min-h-screen flex flex-col justify-center">
      <div className="container mx-auto">
        <div className="flex flex-col items-center space-y-4">
          <canvas ref={canvasRef} className="w-full aspect-video" />

          <audio ref={audioRef} src="/audio.mp3" controls onPlay={play} />
        </div>
      </div>
    </div>
  )
}

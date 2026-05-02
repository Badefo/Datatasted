import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import './App.css'

function App() {
  const [salesData, setSalesData] = useState([12, 19, 15, 17, 24, 23, 28])
  const [fileName, setFileName] = useState('')
  const [aiTip, setAiTip] = useState('Нажми "AI Анализ" или загрузи свой файл')
  const [systemTime, setSystemTime] = useState('')
  const [systemMessages, setSystemMessages] = useState([
    '> INITIALIZING AUDIO PROCESSOR...',
    '> LOADING FREQUENCY DATABASE...',
    '> CALIBRATING SIGNAL FILTERS...',
    '> SYSTEM READY FOR OPERATION'
  ])
  
  // Обновление времени
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      setSystemTime(now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])
  
  // Добавление системного сообщения
  const addSystemMessage = (msg) => {
    setSystemMessages(prev => [...prev.slice(-5), `> ${msg}`])
  }
  
  const chartData = salesData.map((value, index) => ({
    день: `Д${index + 1}`,
    продажи: value
  }))
  
  // Загрузка файла
  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (!file) return
    
    setFileName(file.name)
    addSystemMessage(`LOADING FILE: ${file.name}`)
    const reader = new FileReader()
    
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result)
      const workbook = XLSX.read(data, { type: 'array' })
      const sheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 })
      
      if (!jsonData || jsonData.length === 0) {
        setAiTip('❌ Файл пуст')
        addSystemMessage('ERROR: FILE EMPTY')
        return
      }
      
      let numbers = []
      for (let row = 0; row < jsonData.length; row++) {
        const rowData = jsonData[row]
        if (Array.isArray(rowData) && rowData.length > 0) {
          const value = rowData[0]
          if (typeof value === 'number' && !isNaN(value)) {
            numbers.push(value)
          }
        }
      }
      
      if (numbers.length > 0) {
        setSalesData(numbers.slice(0, 14))
        setAiTip(`✅ Загружено ${numbers.length} значений из ${file.name}`)
        addSystemMessage(`LOADED ${numbers.length} DATA POINTS`)
      } else {
        setAiTip('❌ Файл не содержит чисел в первой колонке')
        addSystemMessage('ERROR: NO NUMERIC DATA FOUND')
      }
    }
    
    reader.readAsArrayBuffer(file)
  }
  
  // Экспорт в Excel
  const exportToExcel = () => {
    const wsData = [['День', 'Продажи']]
    salesData.forEach((value, index) => {
      wsData.push([`День ${index + 1}`, value])
    })
    
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Отчет')
    
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(blob, `report_${new Date().toISOString().slice(0,19)}.xlsx`)
    
    setAiTip('📁 Отчет сохранен!')
    addSystemMessage('EXPORT COMPLETE')
  }
  
  // Обновить случайными данными
  const updateData = () => {
    const newData = salesData.map(() => Math.floor(Math.random() * 50) + 10)
    setSalesData(newData)
    setFileName('')
    setAiTip('🔄 Данные обновлены случайными числами')
    addSystemMessage('GENERATING RANDOM DATA')
  }
  
  // AI анализ
  const analyzeData = () => {
    const avg = (salesData.reduce((a,b) => a+b, 0) / salesData.length).toFixed(1)
    const max = Math.max(...salesData)
    const min = Math.min(...salesData)
    const first = salesData[0]
    const last = salesData[salesData.length - 1]
    
    const x = Array.from({ length: salesData.length }, (_, i) => i + 1)
    const n = x.length
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0
    for (let i = 0; i < n; i++) {
      sumX += x[i]
      sumY += salesData[i]
      sumXY += x[i] * salesData[i]
      sumX2 += x[i] * x[i]
    }
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX)
    const intercept = (sumY - slope * sumX) / n
    const forecast = Math.round(slope * (n + 1) + intercept)
    
    let advice = ''
    let emoji = ''
    
    if (last > first) {
      emoji = '📈'
      advice = `Тренд: РОСТ (${first} → ${last}). `
    } else if (last < first) {
      emoji = '📉'
      advice = `Тренд: ПАДЕНИЕ (${first} → ${last}). `
    } else {
      emoji = '➡️'
      advice = `Тренд: СТАБИЛЬНОСТЬ. `
    }
    
    advice += `Среднее: ${avg}, Макс: ${max}, Мин: ${min}. `
    advice += `Прогноз на завтра: ${forecast}. `
    
    if (forecast > max) {
      advice += `🔥 Ожидается рост! Увеличь запасы.`
    } else if (forecast < min) {
      advice += `⚠️ Ожидается спад. Запусти акции.`
    } else {
      advice += `✅ Стабильный прогноз. Держи курс.`
    }
    
    setAiTip(`${emoji} ${advice}`)
    addSystemMessage('AI ANALYSIS COMPLETE')
  }
  
  const maxValue = Math.max(...salesData)
  
  return (
    <div className="app-container">
      {/* CRT эффекты */}
      <div className="crt-overlay"></div>
      <div className="crt-glow"></div>
      <div className="crt-flicker"></div>
      
      <div className="monitor-frame">
        {/* Заголовок */}
        <div className="system-header">
          <div className="header-top">
            <div className="logo">AI ANALYTICS</div>
            <div className="header-status">
              <div className="status-item">
                <i className="fas fa-bolt status-icon"></i>
                <span className="status-value">98%</span>
              </div>
              <div className="status-item">
                <i className="fas fa-clock status-icon"></i>
                <span className="status-value">{systemTime}</span>
              </div>
              <div className="status-item">
                <i className="fas fa-signal status-icon"></i>
                <span className="status-value">STRONG</span>
              </div>
            </div>
          </div>
          <div className="subtitle">DATA ANALYTICS ARRAY</div>
        </div>

        {/* Системные сообщения */}
        <div className="system-messages">
          {systemMessages.map((msg, i) => (
            <div key={i} className="system-line">{msg}</div>
          ))}
        </div>

        {/* Карточки статистики */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📊</div>
            <div className="stat-value">{(salesData.reduce((a,b) => a+b, 0) / salesData.length).toFixed(1)}</div>
            <div className="stat-label">СРЕДНЕЕ</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div className="stat-value">{Math.max(...salesData)}</div>
            <div className="stat-label">МАКСИМУМ</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📉</div>
            <div className="stat-value">{Math.min(...salesData)}</div>
            <div className="stat-label">МИНИМУМ</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📐</div>
            <div className="stat-value">{Math.max(...salesData) - Math.min(...salesData)}</div>
            <div className="stat-label">РАЗМАХ</div>
          </div>
        </div>

        {/* График */}
        <div className="chart-container">
          <h3 className="chart-title">📊 ДИНАМИКА ПРОДАЖ</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#00FF4133" />
              <XAxis dataKey="день" stroke="#00FF41" />
              <YAxis stroke="#00FF41" />
              <Tooltip contentStyle={{ backgroundColor: '#0A0A0A', border: '1px solid #00FF41', color: '#00FF41' }} />
              <Legend wrapperStyle={{ color: '#00FF41' }} />
              <Line type="monotone" dataKey="продажи" stroke="#00FF41" strokeWidth={3} dot={{ fill: '#00FF41', r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Панель управления */}
        <div className="control-panel">
          <label className="crt-button">
            📂 ЗАГРУЗИТЬ ФАЙЛ
            <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFileUpload} style={{ display: 'none' }} />
          </label>
          <button onClick={updateData} className="crt-button">🎲 СЛУЧАЙНЫЕ</button>
          <button onClick={exportToExcel} className="crt-button">💾 ЭКСПОРТ</button>
          <button onClick={analyzeData} className="crt-button crt-button-primary">🤖 AI АНАЛИЗ</button>
        </div>

        {fileName && <p className="file-info">ФАЙЛ: {fileName}</p>}

        {/* Результат AI */}
        <div className="ai-output">
          <h3 className="ai-title">💡 AI СОВЕТ</h3>
          <p className="ai-text">{aiTip}</p>
        </div>

        {/* Футер */}
        <div className="system-footer">
          <div>WEYLAND-YUTANI CORP - PROPRIETARY TECHNOLOGY</div>
        </div>
      </div>
    </div>
  )
}

export default App
const { spawn } = require('child_process')
const path = require('path')
const fs = require('fs')

const aiDir = path.join(__dirname, 'backend-ai')
const venvDir = path.join(aiDir, '.venv')

const isWin = process.platform === 'win32'
const uvicornName = 'uvicorn' + (isWin ? '.exe' : '')
const venvPaths = [
  path.join(venvDir, 'Scripts', uvicornName),
  path.join(venvDir, 'bin', uvicornName),
]
const uvicornBin = venvPaths.find(p => fs.existsSync(p))

if (!uvicornBin) {
  console.error('Could not find uvicorn in .venv')
  console.error('Looked in:')
  venvPaths.forEach(p => console.error('  ' + p))
  process.exit(1)
}

const args = [
  'app.main:app',
  '--port', process.env.AI_PORT || '8000',
  '--host', '0.0.0.0',
  '--reload',
]

console.log(`Starting Python AI service: ${uvicornBin}`)
console.log(`Working directory: ${aiDir}`)
console.log(`Args: ${args.join(' ')}`)

const proc = spawn(uvicornBin, args, {
  cwd: aiDir,
  stdio: 'inherit',
  env: { ...process.env },
})

proc.on('exit', (code) => {
  process.exit(code)
})

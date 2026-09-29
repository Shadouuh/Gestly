import { execFile } from 'child_process';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);
const port = Number(process.argv[2] || 3001);
const allowedNames = String(process.argv[3] || 'node')
  .split(',')
  .map((value) => value.trim().toLowerCase())
  .filter(Boolean);

const run = async (command, args) => {
  const { stdout, stderr } = await execFileAsync(command, args, { windowsHide: true });
  return { stdout: stdout || '', stderr: stderr || '' };
};

const getListeningPidsWindows = async (targetPort) => {
  const { stdout } = await run('netstat', ['-ano', '-p', 'tcp']);
  return stdout
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line.includes('LISTENING'))
    .map((line) => line.split(/\s+/))
    .filter((parts) => {
      const localAddress = parts[1] || '';
      return localAddress.endsWith(`:${targetPort}`);
    })
    .map((parts) => Number(parts[4]))
    .filter((pid) => Number.isFinite(pid) && pid > 0);
};

const getProcessNameWindows = async (pid) => {
  const { stdout } = await run('tasklist', ['/FI', `PID eq ${pid}`, '/FO', 'CSV', '/NH']);
  const line = stdout.split(/\r?\n/).map((item) => item.trim()).find(Boolean);
  if (!line || line.startsWith('INFO:')) return null;
  const [imageName] = line.replace(/^"|"$/g, '').split('","');
  return imageName || null;
};

const killWindows = async (pid) => {
  await run('taskkill', ['/PID', String(pid), '/F', '/T']);
};

const getListeningPidsUnix = async (targetPort) => {
  const { stdout } = await run('lsof', ['-ti', `tcp:${targetPort}`, '-sTCP:LISTEN']);
  return stdout
    .split(/\r?\n/)
    .map((line) => Number(line.trim()))
    .filter((pid) => Number.isFinite(pid) && pid > 0);
};

const getProcessNameUnix = async (pid) => {
  const { stdout } = await run('ps', ['-p', String(pid), '-o', 'comm=']);
  return stdout.trim() || null;
};

const killUnix = async (pid) => {
  process.kill(pid, 'SIGKILL');
};

const main = async () => {
  const isWindows = process.platform === 'win32';
  const getListeningPids = isWindows ? getListeningPidsWindows : getListeningPidsUnix;
  const getProcessName = isWindows ? getProcessNameWindows : getProcessNameUnix;
  const killProcess = isWindows ? killWindows : killUnix;

  const pids = await getListeningPids(port);

  if (pids.length === 0) {
    console.log(`[free-port] Puerto ${port} libre.`);
    return;
  }

  for (const pid of pids) {
    if (pid === process.pid) continue;

    const processName = await getProcessName(pid);
    const normalizedName = String(processName || '').toLowerCase();
    const canKill = allowedNames.some((allowedName) => normalizedName.includes(allowedName));

    if (!canKill) {
      console.error(`[free-port] El puerto ${port} ya esta en uso por PID ${pid} (${processName || 'desconocido'}).`);
      console.error(`[free-port] No lo cierro automaticamente porque no coincide con los procesos permitidos: ${allowedNames.join(', ')}.`);
      process.exit(1);
    }

    console.log(`[free-port] Cerrando PID ${pid} (${processName}) que ocupa el puerto ${port}...`);
    await killProcess(pid);
  }

  console.log(`[free-port] Puerto ${port} liberado.`);
};

main().catch((error) => {
  console.error('[free-port] No se pudo verificar/liberar el puerto:', error.message || error);
  process.exit(1);
});

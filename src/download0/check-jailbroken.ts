import { fn, BigInt } from 'download0/types'

export function checkJailbroken (): boolean {
  fn.register(24, 'getuid', [], 'bigint')
  fn.register(23, 'setuid', ['number'], 'bigint')

  const uidBefore = fn.getuid()
  const uidBeforeVal = uidBefore instanceof BigInt ? uidBefore.lo : uidBefore
  log('UID before setuid: ' + uidBeforeVal)

  log('Attempting setuid(0)...')

  try {
    const setuidResult = fn.setuid(0)
    const setuidRet = setuidResult instanceof BigInt ? setuidResult.lo : setuidResult
    log('setuid returned: ' + setuidRet)
  } catch (e) {
    log('setuid threw exception: ' + (e as Error).toString())
  }

  const uidAfter = fn.getuid()
  const uidAfterVal = uidAfter instanceof BigInt ? uidAfter.lo : uidAfter
  log('UID after setuid: ' + uidAfterVal)

  const jailbroken = uidAfterVal === 0
  log(jailbroken ? 'Already jailbroken' : 'Not jailbroken')
  if (jailbroken) {
    if (typeof CONFIG !== 'undefined' && CONFIG.autoclose && !BinLoader.skip_autoclose) {
      const closeDelay = (typeof CONFIG !== 'undefined' && CONFIG.autoclose_delay) ? CONFIG.autoclose_delay : 0 // set to 20000 for ps4 hen

      fn.register(0x14, 'getpid', [], 'bigint')
      fn.register(0x25, 'kill', ['bigint', 'bigint'], 'bigint')

      const pid = fn.getpid()
      const pid_num = (pid instanceof BigInt) ? pid.lo : pid
      log('Current PID: ' + pid_num)

      if (closeDelay > 0) {
        log('CONFIG.autoclose enabled - closed after ' + (closeDelay / 1000) + ' seconds...')
        utils.notify('Vue closed after ' + (closeDelay / 1000) + ' seconds...')
        const killId = jsmaf.setInterval(function () {
          jsmaf.clearInterval(killId)
          log('Sending SIGKILL to PID ' + pid_num)
          fn.kill(pid, new BigInt(0, 9))
        }, closeDelay)
      } else {
        log('CONFIG.autoclose enabled - closing now')
        fn.kill(pid, new BigInt(0, 9))
      }
    }
  }
  return jailbroken
}

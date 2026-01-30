import * as C from './component'
import { setListOptions } from './list-utils.js'

export function initNetworkList() {
  const network = C.MenuParams.message.network
  if (network === 'none') return []

  let options = []
  network.forEach((nic) => {
    let { up, running } = nic
    if (up && running) {
      if (nic.iw) {
        let label = `${nic.name} [${nic.address}]`
        options.push({ text: `${label} channel: ${nic.iw.channel}`, value: nic.name })
      }
      if (nic.ethtool) {
        let label = `${nic.name} [${nic.address}]`
        let Speed = nic.ethtool.find((e) => e.key === 'Speed').value
        options.push({ text: `${label} : ${Speed}`, value: nic.name })
      }
    }
  })

  setListOptions(C.NetworkDeviceList, options)
}

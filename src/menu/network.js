import Alpine from 'alpinejs'
import { setListOptions } from './list-utils.js'

export function initNetworkList() {
  const network = Alpine.store('menu').message.network
  if (network === 'none') return

  const options = []
  network.forEach((nic) => {
    if (!nic.up || !nic.running) return
    if (nic.iw) {
      options.push({ text: `${nic.name} [${nic.address}] channel: ${nic.iw.channel}`, value: nic.name })
    }
    if (nic.ethtool) {
      const Speed = nic.ethtool.find((e) => e.key === 'Speed').value
      options.push({ text: `${nic.name} [${nic.address}] : ${Speed}`, value: nic.name })
    }
  })

  setListOptions('network_interface', 'network_options', options)
}

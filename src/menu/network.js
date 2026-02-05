import Alpine from 'alpinejs'
import { setListOptions } from './utils/list-utils.js'

/**
 * VTX から受け取ったネットワークインターフェース一覧を Alpine ストアにセットする
 * up かつ running のインターフェースのみを対象とし、WiFi / 有線 Ethernet を区別する
 */
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

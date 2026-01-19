import * as C from '../component'

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

  options.unshift(C.Placeholder)

  C.NetworkDeviceList.options = options
  C.MenuParams.network_interface = options[options.length === 1 ? 0 : 1].value
  C.NetworkDeviceList.refresh()
}

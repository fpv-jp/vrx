import * as C from '../component'

export function initBordList() {
  const flight_controllers = C.MenuParams.message.flight_controllers
  if (flight_controllers === 'none') return []

  let options = []
  flight_controllers.forEach((fc) => {
    let { manufacturer_id, target_name, board_name } = fc.msp_board_info
    options.push({ text: `[${target_name}] ${manufacturer_id} ${board_name}`, value: fc.port })
  })

  options.unshift(C.Placeholder)

  C.BordDeviceList.options = options
  C.MenuParams.flight_controller = options[options.length === 1 ? 0 : 1].value
  C.BordDeviceList.refresh()
}

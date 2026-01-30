import * as C from './component'
import { setListOptions } from './list-utils.js'

export function initBordList() {
  const flight_controllers = C.MenuParams.message.flight_controllers
  if (flight_controllers === 'none') return []

  let options = []
  flight_controllers.forEach((fc) => {
    let { manufacturer_id, target_name, board_name } = fc.msp_board_info
    options.push({ text: `[${target_name}] ${manufacturer_id} ${board_name}`, value: fc.port })
  })

  setListOptions(C.BordDeviceList, options)
}

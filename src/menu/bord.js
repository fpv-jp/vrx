import Alpine from 'alpinejs'
import { setListOptions } from './utils/list-utils.js'

/**
 * VTX から受け取ったフライトコントローラー一覧を Alpine ストアにセットする
 * MSP BOARD_INFO の manufacturer_id / target_name / board_name を表示テキストとして使用する
 */
export function initBordList() {
  const flight_controllers = Alpine.store('menu').message.flight_controllers
  if (flight_controllers === 'none') return

  const options = flight_controllers.map((fc) => {
    const { manufacturer_id, target_name, board_name } = fc.msp_board_info
    return { text: `[${target_name}] ${manufacturer_id} ${board_name}`, value: fc.port }
  })

  setListOptions('flight_controller', 'bord_options', options)
}

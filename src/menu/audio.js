import Alpine from 'alpinejs'
import Constants from '../constants.js'
import * as ParameterUtils from './utils/parameter-utils.js'
import { browserCodecList, sortByOrder } from './utils/codec-utils.js'
import { checkRequiredKeys } from './utils/parameter-utils.js'
import { setListOptions } from './utils/list-utils.js'

const { BROWSER, GSTREAMER } = Constants.Source

/**
 * source に応じた音声コーデックのリストを返す
 * @param {'browser'|'gstreamer'} source
 * @param {object[]} codecs
 * @returns {{ text: string, value: string }[]}
 */
function getCodecList(source, codecs) {
  if (source === BROWSER) return browserCodecList(codecs)
  if (source === GSTREAMER) return sortByOrder(
    codecs.map((codec) => ({ text: codec.name, value: JSON.stringify(codec) })),
    ['opus', 'mulaw'],
  )
  return []
}

/**
 * source と選択デバイスに応じた音声サンプリングオプションを返す
 * @param {'browser'|'gstreamer'} source
 * @returns {{ text: string, value: string }[]}
 */
function getSamplingList(source) {
  const store = Alpine.store('menu')
  if (source === BROWSER) {
    if (store.audio_codec === 'none') return []
    const codec = JSON.parse(store.audio_codec)
    return [{ text: `clockRate ${codec.clockRate} channels ${codec.channels}`, value: JSON.stringify(codec) }]
  }
  if (source === GSTREAMER) {
    if (store.audio_device === 'none') return []
    const device = JSON.parse(store.audio_device)
    return device.caps.map((cap) => ({ text: cap, value: cap }))
  }
  return []
}

/**
 * GStreamer ソースの場合に音声 caps からサブメニュー（format / rate / channels）を展開する
 * @param {'browser'|'gstreamer'} source
 */
function showSubMenu(source) {
  const store = Alpine.store('menu')
  store.audio_mimetype_show = false
  store.audio_format_mode = 'hidden'
  store.audio_rate_mode = 'hidden'
  store.audio_channels_mode = 'hidden'

  if (source !== GSTREAMER) return

  store.audio_mimetype_show = true
  ParameterUtils.setMenuOptionText('audio_mimetype', store.audio_sampling.match(/audio\/([^\s,]+)/)?.[1])

  const format = ParameterUtils.getAudioSamplingParameter('format')
  if (format != null) {
    if (format.startsWith('{')) ParameterUtils.setListParameterOption('audio_format', format)
    else ParameterUtils.setTextOrNumberField('audio_format', format)
  }

  const rate = ParameterUtils.getAudioSamplingParameter('rate')
  if (rate != null) {
    if (rate.startsWith('{')) ParameterUtils.setListParameterOption('audio_rate', rate)
    else if (rate.startsWith('[')) { ParameterUtils.setSliderParameterOption('audio_rate', rate); store.audio_rate = 48000 }
    else ParameterUtils.setTextOrNumberField('audio_rate', rate)
  }

  const channels = ParameterUtils.getAudioSamplingParameter('channels')
  if (channels != null) {
    if (channels.startsWith('{')) ParameterUtils.setListParameterOption('audio_channels', channels)
    else if (channels.startsWith('[')) { ParameterUtils.setSliderParameterOption('audio_channels', channels); store.audio_channels = 1 }
    else ParameterUtils.setTextOrNumberField('audio_channels', channels)
  }
}

/**
 * サンプリングまたはコーデック変更時にサブメニューと connectionDisabled を更新する
 */
function onSamplingOrCodecChange() {
  const store = Alpine.store('menu')
  if (store.audio_codec !== 'none') showSubMenu(store.message?.source)
  store.connectionDisabled = checkRequiredKeys()
}

window.addEventListener('menu:audio-device-change', () => {
  if (Alpine.store('menu').sender !== 'none') initSamplingList()
})

window.addEventListener('menu:audio-sampling-change', onSamplingOrCodecChange)
window.addEventListener('menu:audio-codec-change', onSamplingOrCodecChange)

/** 選択中のデバイスに対応したサンプリングオプションをストアにセットする */
function initSamplingList() {
  const store = Alpine.store('menu')
  setListOptions('audio_sampling', 'audio_sampling_options', getSamplingList(store.message.source))
  onSamplingOrCodecChange()
}

/**
 * MEDIA_DEVICE_LIST_RESPONSE 受信後に音声コーデックとサンプリングリストを初期化する
 */
export function initAudioList() {
  const { source, codecs } = Alpine.store('menu').message
  setListOptions('audio_codec', 'audio_codec_options', getCodecList(source, codecs.audio))
  initSamplingList()
}

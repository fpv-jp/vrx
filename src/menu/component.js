import { Pane } from 'tweakpane'

// Connection Menu
// -----------------------------------------------
export const ConnectionMenu = new Pane({
  title: 'Menu',
  container: TweakpaneMenu,
})

export const defaultOption = { '-- please select --': 'none' }
export const defaultOptionNumber = { '-- please select --': 0 }
export const Placeholder = { text: '-- please select --', value: 'none' }

export const MenuParams = {
  message: null,

  senders: [],
  sender: 'none',

  network_interface: 'none',
  flight_controller: 'none',

  video_device: 'none',
  video_codec: 'none',
  video_capture: '',

  video_mimetype: '',
  video_format: '',
  video_drm_format: '',
  video_width: 0,
  video_height: 0,
  video_framerate: 0,

  audio_device: 'none',
  audio_codec: 'none',
  audio_sampling: '',

  audio_mimetype: '',
  audio_format: '',
  audio_rate: 0,
  audio_channels: 0,

  grayscale: false,
  mute: true,
}

// Sender Entry -----------------------------------------------

export const SenderEntryList = ConnectionMenu.addBinding(MenuParams, 'sender', {
  label: 'Sender',
  view: 'list',
  options: defaultOption,
})

// Network Interface -----------------------------------------------

export const Network = ConnectionMenu.addFolder({
  title: 'Network interface',
  expanded: true,
  hidden: true,
})

export const NetworkDeviceList = Network.addBinding(MenuParams, 'network_interface', {
  label: 'Device',
  view: 'list',
  options: defaultOption,
})

// Flight controller -----------------------------------------------

export const Bord = ConnectionMenu.addFolder({
  title: 'Flight controller',
  expanded: true,
  hidden: true,
})

export const BordDeviceList = Bord.addBinding(MenuParams, 'flight_controller', {
  label: 'Device',
  view: 'list',
  options: defaultOption,
})

// Video Main --------------------------------

export const Video = ConnectionMenu.addFolder({
  title: 'Video camera',
  expanded: true,
  hidden: true,
})

export const VideoDeviceList = Video.addBinding(MenuParams, 'video_device', {
  label: 'Device',
  view: 'list',
  options: defaultOption,
})

export const VideoCodecList = Video.addBinding(MenuParams, 'video_codec', {
  label: 'Encoder',
  view: 'list',
  options: defaultOption,
})

export const VideoCaptureList = Video.addBinding(MenuParams, 'video_capture', {
  label: 'Capture',
  view: 'list',
  options: defaultOption,
})

export const VideoSeparator = Video.addBlade({
  view: 'separator',
})

// Video MimeType --------------------------------

export const VideoMimeType = Video.addBinding(MenuParams, 'video_mimetype', {
  label: 'MimeType',
  view: 'text',
  readonly: true,
})

// Video Format --------------------------------

export const VideoFormat = Video.addBinding(MenuParams, 'video_format', {
  label: 'Format',
  view: 'text',
  readonly: true,
})

export const VideoFormatList = Video.addBinding(MenuParams, 'video_format', {
  label: 'Format',
  view: 'list',
  options: defaultOption,
})

// Video DRM Format --------------------------------

export const VideoDRMFormat = Video.addBinding(MenuParams, 'video_drm_format', {
  label: 'DRM Format',
  view: 'text',
  readonly: true,
})

export const VideoDRMFormatList = Video.addBinding(MenuParams, 'video_drm_format', {
  label: 'DRM Format',
  view: 'list',
  options: defaultOption,
})

// Video Width --------------------------------

export const VideoWidth = Video.addBinding(MenuParams, 'video_width', {
  label: 'Width',
  view: 'text',
  format: (v) => v.toFixed(0),
  readonly: true,
})

export const VideoWidthList = Video.addBinding(MenuParams, 'video_width', {
  label: 'Width',
  view: 'list',
  options: defaultOptionNumber,
})

export const VideoWidthSlider = Video.addBinding(MenuParams, 'video_width', {
  label: 'Width',
  view: 'slider',
  min: 1,
  max: 100,
  step: 1,
})

// Video Height --------------------------------

export const VideoHeight = Video.addBinding(MenuParams, 'video_height', {
  label: 'Height',
  view: 'text',
  format: (v) => v.toFixed(0),
  readonly: true,
})

export const VideoHeightList = Video.addBinding(MenuParams, 'video_height', {
  label: 'Height',
  view: 'list',
  options: defaultOptionNumber,
})

export const VideoHeightSlider = Video.addBinding(MenuParams, 'video_height', {
  label: 'Height',
  view: 'slider',
  min: 1,
  max: 100,
  step: 1,
})

// Video Framerate --------------------------------

export const VideoFramerate = Video.addBinding(MenuParams, 'video_framerate', {
  label: 'Framerate',
  view: 'text',
  format: (v) => v.toFixed(0),
  readonly: true,
})

export const VideoFramerateList = Video.addBinding(MenuParams, 'video_framerate', {
  label: 'Framerate',
  view: 'list',
  options: defaultOptionNumber,
})

export const VideoFramerateSlider = Video.addBinding(MenuParams, 'video_framerate', {
  label: 'Framerate',
  view: 'slider',
  min: 1,
  max: 100,
  step: 1,
})

// Audio Main --------------------------------
export const Audio = ConnectionMenu.addFolder({
  title: 'Audio microphone',
  expanded: true,
  hidden: true,
})

export const AudioDeviceList = Audio.addBinding(MenuParams, 'audio_device', {
  label: 'Device',
  view: 'list',
  options: defaultOption,
})

export const AudioCodecList = Audio.addBinding(MenuParams, 'audio_codec', {
  label: 'Encoder',
  view: 'list',
  options: defaultOption,
})

export const AudioSamplingList = Audio.addBinding(MenuParams, 'audio_sampling', {
  label: 'Sampling',
  view: 'list',
  options: defaultOption,
})

export const AudioSeparator = Audio.addBlade({
  view: 'separator',
})

// Audio MimeType --------------------------------

export const AudioMimeType = Audio.addBinding(MenuParams, 'audio_mimetype', {
  label: 'MimeType',
  view: 'text',
  readonly: true,
})

// Audio Format --------------------------------

export const AudioFormat = Audio.addBinding(MenuParams, 'audio_format', {
  label: 'Format',
  view: 'text',
  readonly: true,
})

export const AudioFormatList = Audio.addBinding(MenuParams, 'audio_format', {
  label: 'Format',
  view: 'list',
  options: defaultOption,
})

// Audio Rate --------------------------------

export const AudioRate = Audio.addBinding(MenuParams, 'audio_rate', {
  label: 'Rate',
  view: 'text',
  format: (v) => v.toFixed(0),
  readonly: true,
})

export const AudioRateList = Audio.addBinding(MenuParams, 'audio_rate', {
  label: 'Rate',
  view: 'list',
  options: defaultOptionNumber,
})

export const AudioRateSlider = Audio.addBinding(MenuParams, 'audio_rate', {
  label: 'Rate',
  view: 'slider',
  min: 1,
  max: 100,
  step: 1,
})

// Audio Channels --------------------------------

export const AudioChannels = Audio.addBinding(MenuParams, 'audio_channels', {
  label: 'Channels',
  view: 'text',
  format: (v) => v.toFixed(0),
  readonly: true,
})

export const AudioChannelsList = Audio.addBinding(MenuParams, 'audio_channels', {
  label: 'Channels',
  view: 'list',
  options: defaultOptionNumber,
})

export const AudioChannelsSlider = Audio.addBinding(MenuParams, 'audio_channels', {
  label: 'Channels',
  view: 'slider',
  min: 1,
  max: 100,
  step: 1,
})

// Connection --------------------------------

export const ConnectionText = {
  Start: '🎦 Start',
  Hangup: '⛔ Stop',
}

export const ConnectionButton = ConnectionMenu.addButton({
  title: ConnectionText.Start,
  hidden: true,
})

// SubControl Main -----------------------------------------------

export const SubControl = ConnectionMenu.addFolder({
  title: 'Sub Control',
  expanded: true,
  hidden: true,
})

// GrayscaleCheck -----------------------------------------------

export const GrayscaleCheck = SubControl.addBinding(MenuParams, 'grayscale', {
  label: 'Grayscale',
})

// MuteCheck -----------------------------------------------

export const MuteCheck = SubControl.addBinding(MenuParams, 'mute', {
  label: 'Mute',
})

// FullScreen -----------------------------------------------

export const FullScreenButton = SubControl.addButton({
  title: 'Fullscreen',
})

// WebrtcReport -----------------------------------------------

export const WebrtcReportButton = SubControl.addButton({
  title: 'Webrtc Report',
})

// SearchRadar -----------------------------------------------

export const SearchRadarButton = SubControl.addButton({
  title: 'Search Radar',
})

export function isIOS() {
  let appleProduct = ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod']
  return appleProduct.includes(navigator.platform) || (navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1)
}

let PermissionButton
export function showPermissionButton() {
  PermissionButton = document.createElement('button')
  PermissionButton.textContent = 'Request Motion Permission'
  PermissionButton.id = 'requestPermission'

  Object.assign(PermissionButton.style, {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    padding: '10px 20px',
    'z-index': 10,
  })

  PermissionButton.onclick = async () => {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      let permissionState = await DeviceMotionEvent.requestPermission()
      if (permissionState === 'granted') {
        console.log('Motion permission granted!')
      } else {
        console.error('Motion permission denied.')
      }
    }
  }

  document.body.appendChild(PermissionButton)
}

export function removePermissionButton() {
  if (PermissionButton && document.body.contains(PermissionButton)) {
    document.body.removeChild(PermissionButton)
  }
}

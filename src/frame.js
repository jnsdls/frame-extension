const EventEmitter = require('events')
const EthereumProvider = require('ethereum-provider')

class Connection extends EventEmitter {
  constructor () {
    super()
    window.addEventListener('message', event => {
      if (event && event.source === window && event.data && event.data.type === 'eth:payload') {
        this.emit('payload', event.data.payload)
      }
    })
    setTimeout(() => this.emit('connect'), 0)
  }

  send (payload) {
    window.postMessage({ type: 'eth:send', payload }, window.location.origin)
  }
}

let mmAppear = window.localStorage.getItem('__frameAppearAsMM__')

try {
  mmAppear = JSON.parse(mmAppear)
} catch (e) {
  mmAppear = false
}

if (mmAppear) {
  class MetaMaskProvider extends EthereumProvider { }

  try {
    window.ethereum = new MetaMaskProvider(new Connection())
    window.ethereum.isMetaMask = true
    window.ethereum._metamask = {
      isUnlocked: () => true
    }
    window.ethereum.setMaxListeners(0)
  } catch (e) {
    console.error('Frame Error:', e)
  }
} else {
  class FrameProvider extends EthereumProvider { }

  try {
    window.ethereum = new FrameProvider(new Connection())
    window.ethereum.isFrame = true
    window.ethereum.setMaxListeners(0)
  } catch (e) {
    console.error('Frame Error:', e)
  }

  // implement support for EIP-6963
  announceProvider({
    info: {
      name: 'Frame',
      rdns: 'sh.frame',
      uuid: window.crypto.randomUUID(),
      icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAABgCAYAAADimHc4AAACmklEQVR4nO3csWsTYRyH8afXcihiMxdBUZwKpbPOTiIitlIqKP4FIoLi5Cau4uDgKKgotovSOri24CKIUlyk4uQkIg5ihzpcDkO5ixrS3/cu7/cDIXB3cL/mIe8lkN7Y/OIFuvYDV4BzwFFgL83yGVgE1tWDDNNE93kaeAEcFs7yNweBVeAksCaeZWgyYBJYodkvfqmc9bh6kGHJgMvAIfUg/6GMcEw9yDBkFGt+23QolqPWvxMmKNb/NurQ3GvBK+ANcB/42O/AjD8XYhueE8B1YAO40e/ALGScdOXAbeBq3QEOEOMWcKBqhwPE2AMsVO1wgDgzVRsdIM6lqo0OIOYAYg4g5gBiDiDmAGIOIOYAYg4g5gBiDiDmAGIOIOYAYg4gFh1gChhr+OPIrv31FaIDfAk+3yA2I0/mJUjMAcQcQMwBxBxAzAHEHEDMAcQcQMwBxBxAzAHEHEAsA76ph0hZBlwEfqkHSVUGPKe4B4MjCJTXgGUcQaL3IrwMnAe2RLMkaeenoCWKCBak6mPos/Ap0jG3c4O/B8R6BJzt3eAAsXLgMT0RHCBeGeEMOIBKDjwBTjuATg48cACtjgOIOYCYA4g5gJgDiDmAmAOIOYCYA4g5gJgDiDmAmAOIRQfYF3y+QUxGniz61vU/gs/XeF6CxBxAzAHEHEDMAcQcQMwBxBxAzAHEHEDMAcQcQMwBxBxAzAHE6gKshk6RsLoAb0OnSFhdgIfAduQgqaoL8B64EzlIqvpdhK8B9/A7YVeNT8/M1u3bBlaAl8B4d9tUxFAJ2fqXX0W87j6aao7iP9Bz9SAD+DAK3wOWaO+tdp6OQgBo5/2ONoG7oxIA2nW/o0/AKeD7KAWAYjlaAL6qB6nwE3gH3ARmgQ2A3xUaRM/9+UexAAAAAElFTkSuQmCC'
    },
    provider: new FrameProvider(new Connection())
  })
}

/**
 * Announces an EIP-1193 Provider.
 */
export function announceProvider (
  detail
) {
  const event = new CustomEvent(
    'eip6963:announceProvider',
    { detail: Object.freeze(detail) }
  )

  window.dispatchEvent(event)

  const handler = () => window.dispatchEvent(event)
  window.addEventListener('eip6963:requestProvider', handler)
  return () => window.removeEventListener('eip6963:requestProvider', handler)
}

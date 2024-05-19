function getToken(_0x127042) {
  _0x127042.preventDefault()
  const _0x271007 = document.getElementById('username').value,
    _0x51c82e = document.getElementById('password').value
  fetch('/api?username=' + _0x271007 + '&password=' + _0x51c82e)
    .then((_0x562f07) => _0x562f07.json())
    .then((_0x5091a2) => {
      _0x5091a2.access_token
        ? (document.getElementById('response').innerHTML =
            _0x5091a2.access_token)
        : (document.getElementById('response').innerHTML = _0x5091a2.message)
    })
    .catch((_0x4c8d4c) => {
      console.error('Error:', _0x4c8d4c)
    })
}
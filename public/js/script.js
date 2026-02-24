// Issue type selection
  document.querySelectorAll('.issue-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.issue-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      document.getElementById('categoryInput').value = card.dataset.type;
    });
  });

  // Image preview
  const photoInput = document.getElementById('photoInput');
  photoInput.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      document.getElementById('previewImg').src = ev.target.result;
      document.getElementById('previewWrap').style.display = 'block';
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('removeImg').addEventListener('click', () => {
    document.getElementById('previewImg').src = '';
    document.getElementById('previewWrap').style.display = 'none';
    photoInput.value = '';
  });

  function openCamera() {
    photoInput.setAttribute('capture', 'environment');
    photoInput.click();
  }

  // GPS
  function getLocation() {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      document.getElementById('latVal').textContent = pos.coords.latitude.toFixed(5);
      document.getElementById('lngVal').textContent = pos.coords.longitude.toFixed(5);
    });
  }
  getLocation();

  // Speech-to-text
  let recognition, isRecording = false;
  function toggleSTT() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return alert('Voice input not supported in this browser.');
    const btn = document.getElementById('sttBtn');
    if (isRecording) return recognition.stop();
    recognition = new SR();
    recognition.lang = 'en-IN';
    recognition.onstart = () => {
      isRecording = true;
      btn.classList.add('recording');
    };
    recognition.onresult = e => {
      document.getElementById('description').value =
        e.results[0][0].transcript;
    };
    recognition.onend = () => {
      isRecording = false;
      btn.classList.remove('recording');
    };
    recognition.start();
  }
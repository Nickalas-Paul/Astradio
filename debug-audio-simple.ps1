# Simple Audio Debugging Script
Write-Host "🔍 SIMPLE AUDIO DEBUGGING" -ForegroundColor Red
Write-Host "================================" -ForegroundColor Red
Write-Host ""

$API_BASE = 'http://localhost:3001'
$WEB_BASE = 'http://localhost:3000'

# Test 1: API Health
Write-Host "STEP 1: Testing API Health" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/health" -Method GET -TimeoutSec 10
    Write-Host "✅ API is responding: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ API is not responding: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Start the backend: cd apps/api && npm start" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Test 2: Chart Generation
Write-Host "STEP 2: Testing Chart Generation" -ForegroundColor Yellow
$chartBody = @{
    birth_data = @{
        date = "1990-05-15"
        time = "14:30"
        latitude = 40.7128
        longitude = -74.0060
        timezone = -5
    }
}

try {
    $jsonBody = $chartBody | ConvertTo-Json -Depth 10
    $response = Invoke-WebRequest -Uri "$API_BASE/api/charts/generate" -Method POST -Body $jsonBody -ContentType "application/json" -TimeoutSec 30
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.success) {
        Write-Host "✅ Chart generated successfully" -ForegroundColor Green
        Write-Host "   Planets found: $($data.data.chart.planets.PSObject.Properties.Name.Count)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Chart generation failed: $($data.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Chart generation error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Audio Generation
Write-Host "STEP 3: Testing Audio Generation" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/api/audio/daily?genre=ambient&duration=30" -Method GET -TimeoutSec 30
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.success) {
        Write-Host "✅ Audio generated successfully" -ForegroundColor Green
        Write-Host "   Audio URL: $($data.data.audio_url)" -ForegroundColor Cyan
        
        # Test audio file access
        $audioUrl = "$API_BASE$($data.data.audio_url)"
        try {
            $audioResponse = Invoke-WebRequest -Uri $audioUrl -Method GET -TimeoutSec 10
            Write-Host "✅ Audio file accessible: $($audioResponse.StatusCode)" -ForegroundColor Green
            Write-Host "   File size: $($audioResponse.Content.Length) bytes" -ForegroundColor Cyan
        } catch {
            Write-Host "❌ Audio file not accessible: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Audio generation failed: $($data.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Audio generation error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Frontend
Write-Host "STEP 4: Testing Frontend" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$WEB_BASE" -Method GET -TimeoutSec 10
    Write-Host "✅ Frontend is accessible: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "💡 Open $WEB_BASE in your browser to test audio playback" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Frontend not accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Start the frontend: cd apps/web && npm run dev" -ForegroundColor Yellow
}

Write-Host ""

# Create browser test files
Write-Host "STEP 5: Creating Browser Test Files" -ForegroundColor Yellow

# Audio Context Test
$audioTestHtml = @"
<!DOCTYPE html>
<html>
<head><title>Audio Test</title></head>
<body>
    <h1>Audio Context Test</h1>
    <button onclick="testAudio()">Test Audio</button>
    <div id="result"></div>
    <script>
        async function testAudio() {
            try {
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                await audioContext.resume();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.5);
                document.getElementById('result').innerHTML = '<p style="color: green;">✅ Audio test completed - did you hear a beep?</p>';
            } catch (error) {
                document.getElementById('result').innerHTML = '<p style="color: red;">❌ Audio test failed: ' + error.message + '</p>';
            }
        }
    </script>
</body>
</html>
"@

$audioTestHtml | Out-File -FilePath "audio-test.html" -Encoding UTF8
Write-Host "✅ Created audio-test.html" -ForegroundColor Green

# Tone.js Test
$toneTestHtml = @"
<!DOCTYPE html>
<html>
<head>
    <title>Tone.js Test</title>
    <script src="https://unpkg.com/tone@14.7.77/build/Tone.js"></script>
</head>
<body>
    <h1>Tone.js Test</h1>
    <button onclick="testTone()">Test Tone.js</button>
    <div id="result"></div>
    <script>
        async function testTone() {
            try {
                await Tone.start();
                const synth = new Tone.Synth().toDestination();
                synth.triggerAttackRelease("C4", "8n");
                document.getElementById('result').innerHTML = '<p style="color: green;">✅ Tone.js test completed - did you hear a C4 note?</p>';
            } catch (error) {
                document.getElementById('result').innerHTML = '<p style="color: red;">❌ Tone.js test failed: ' + error.message + '</p>';
            }
        }
    </script>
</body>
</html>
"@

$toneTestHtml | Out-File -FilePath "tone-test.html" -Encoding UTF8
Write-Host "✅ Created tone-test.html" -ForegroundColor Green

Write-Host ""
Write-Host "🎯 NEXT STEPS:" -ForegroundColor Green
Write-Host "1. Open audio-test.html in your browser and click 'Test Audio'" -ForegroundColor Yellow
Write-Host "2. Open tone-test.html in your browser and click 'Test Tone.js'" -ForegroundColor Yellow
Write-Host "3. If both tests work, the issue is in your app's audio implementation" -ForegroundColor Yellow
Write-Host "4. If tests fail, it's a browser/system audio issue" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎵 Debugging complete!" -ForegroundColor Green 
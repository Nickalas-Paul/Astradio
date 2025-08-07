# Immediate Audio Debugging Script
# Tests each component of the audio system step by step

Write-Host "🔍 IMMEDIATE AUDIO DEBUGGING" -ForegroundColor Red
Write-Host "==========================================" -ForegroundColor Red
Write-Host ""

$API_BASE = 'http://localhost:3001'
$WEB_BASE = 'http://localhost:3000'

# Function to test API endpoint
function Test-ApiEndpoint {
    param($url, $description)
    
    Write-Host "🔍 Testing: $description" -ForegroundColor Yellow
    Write-Host "   URL: $url" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10
        Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "   📄 Content-Type: $($response.Headers.'Content-Type')" -ForegroundColor Cyan
        
        if ($response.Content) {
            $content = $response.Content | ConvertFrom-Json
            Write-Host "   📊 Response keys: $($content.PSObject.Properties.Name -join ', ')" -ForegroundColor Cyan
        }
        
        return $true
    } catch {
        Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to test audio generation
function Test-AudioGeneration {
    param($endpoint, $description, $body)
    
    Write-Host "🎵 Testing: $description" -ForegroundColor Yellow
    Write-Host "   Endpoint: $endpoint" -ForegroundColor Gray
    
    try {
        $jsonBody = $body | ConvertTo-Json -Depth 10
        $response = Invoke-WebRequest -Uri "$API_BASE$endpoint" -Method POST -Body $jsonBody -ContentType "application/json" -TimeoutSec 30
        
        Write-Host "   ✅ Status: $($response.StatusCode)" -ForegroundColor Green
        
        $data = $response.Content | ConvertFrom-Json
        if ($data.success) {
            Write-Host "   🎵 Audio generated successfully" -ForegroundColor Green
            if ($data.data.audio_url) {
                Write-Host "   📁 Audio URL: $($data.data.audio_url)" -ForegroundColor Cyan
                
                # Test if audio file is accessible
                $audioUrl = "$API_BASE$($data.data.audio_url)"
                Write-Host "   🔍 Testing audio file access: $audioUrl" -ForegroundColor Gray
                
                try {
                    $audioResponse = Invoke-WebRequest -Uri $audioUrl -Method GET -TimeoutSec 10
                    Write-Host "   ✅ Audio file accessible: $($audioResponse.StatusCode)" -ForegroundColor Green
                    Write-Host "   📄 Audio Content-Type: $($audioResponse.Headers.'Content-Type')" -ForegroundColor Cyan
                    Write-Host "   📏 File size: $($audioResponse.Content.Length) bytes" -ForegroundColor Cyan
                } catch {
                    Write-Host "   ❌ Audio file NOT accessible: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "   ❌ Audio generation failed: $($data.error)" -ForegroundColor Red
        }
        
        return $data
    } catch {
        Write-Host "   ❌ FAILED: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Function to test browser audio context
function Test-BrowserAudio {
    Write-Host "🌐 Testing Browser Audio Context" -ForegroundColor Yellow
    
    # Create a simple HTML test file
    $testHtml = @"
<!DOCTYPE html>
<html>
<head>
    <title>Audio Test</title>
</head>
<body>
    <h1>Audio Context Test</h1>
    <button id="testBtn">Test Audio Context</button>
    <div id="results"></div>
    
    <script>
        document.getElementById('testBtn').addEventListener('click', async () => {
            const results = document.getElementById('results');
            results.innerHTML = '';
            
            try {
                // Test 1: AudioContext creation
                console.log('Testing AudioContext...');
                const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                results.innerHTML += '<p style="color: green;">✅ AudioContext created successfully</p>';
                
                // Test 2: Resume context
                console.log('Resuming AudioContext...');
                await audioContext.resume();
                results.innerHTML += '<p style="color: green;">✅ AudioContext resumed successfully</p>';
                
                // Test 3: Create oscillator
                console.log('Creating oscillator...');
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                
                oscillator.start();
                oscillator.stop(audioContext.currentTime + 0.5);
                
                results.innerHTML += '<p style="color: green;">✅ Oscillator test completed</p>';
                
                // Test 4: Check if audio is actually playing
                setTimeout(() => {
                    results.innerHTML += '<p style="color: blue;">🎵 Audio test completed - did you hear a beep?</p>';
                }, 600);
                
            } catch (error) {
                console.error('Audio test failed:', error);
                results.innerHTML += '<p style="color: red;">❌ Audio test failed: ' + error.message + '</p>';
            }
        });
    </script>
</body>
</html>
"@

    $testFile = "audio-test.html"
    $testHtml | Out-File -FilePath $testFile -Encoding UTF8
    
    Write-Host "   📄 Created test file: $testFile" -ForegroundColor Cyan
    Write-Host "   🌐 Open this file in your browser and click the test button" -ForegroundColor Yellow
    Write-Host "   🎵 You should hear a 440Hz beep if audio is working" -ForegroundColor Yellow
    
    # Try to open the file
    try {
        Start-Process $testFile
        Write-Host "   ✅ Opened test file in browser" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Could not auto-open file. Please open $testFile manually" -ForegroundColor Yellow
    }
}

# Function to test Tone.js specifically
function Test-ToneJS {
    Write-Host "🎼 Testing Tone.js Audio" -ForegroundColor Yellow
    
    $toneTestHtml = @"
<!DOCTYPE html>
<html>
<head>
    <title>Tone.js Test</title>
    <script src="https://unpkg.com/tone@14.7.77/build/Tone.js"></script>
</head>
<body>
    <h1>Tone.js Audio Test</h1>
    <button id="toneBtn">Test Tone.js</button>
    <div id="toneResults"></div>
    
    <script>
        document.getElementById('toneBtn').addEventListener('click', async () => {
            const results = document.getElementById('toneResults');
            results.innerHTML = '';
            
            try {
                // Test 1: Tone.js initialization
                console.log('Initializing Tone.js...');
                await Tone.start();
                results.innerHTML += '<p style="color: green;">✅ Tone.js initialized</p>';
                
                // Test 2: Create synth
                console.log('Creating synth...');
                const synth = new Tone.Synth().toDestination();
                results.innerHTML += '<p style="color: green;">✅ Synth created</p>';
                
                // Test 3: Play a note
                console.log('Playing test note...');
                synth.triggerAttackRelease("C4", "8n");
                results.innerHTML += '<p style="color: green;">✅ Note triggered</p>';
                
                // Test 4: Check if audio is actually playing
                setTimeout(() => {
                    results.innerHTML += '<p style="color: blue;">🎵 Tone.js test completed - did you hear a C4 note?</p>';
                }, 1000);
                
            } catch (error) {
                console.error('Tone.js test failed:', error);
                results.innerHTML += '<p style="color: red;">❌ Tone.js test failed: ' + error.message + '</p>';
            }
        });
    </script>
</body>
</html>
"@

    $toneTestFile = "tone-test.html"
    $toneTestHtml | Out-File -FilePath $toneTestFile -Encoding UTF8
    
    Write-Host "   📄 Created Tone.js test file: $toneTestFile" -ForegroundColor Cyan
    Write-Host "   🌐 Open this file in your browser and click the test button" -ForegroundColor Yellow
    Write-Host "   🎵 You should hear a C4 note if Tone.js is working" -ForegroundColor Yellow
    
    try {
        Start-Process $toneTestFile
        Write-Host "   ✅ Opened Tone.js test file in browser" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Could not auto-open file. Please open $toneTestFile manually" -ForegroundColor Yellow
    }
}

# Main debugging sequence
Write-Host "🚀 Starting comprehensive audio debugging..." -ForegroundColor Green
Write-Host ""

# Step 1: Test API health
Write-Host "STEP 1: API Health Check" -ForegroundColor Magenta
Write-Host "------------------------" -ForegroundColor Magenta
$apiHealthy = Test-ApiEndpoint -url "$API_BASE/health" -description "API Health Endpoint"

if (-not $apiHealthy) {
    Write-Host "❌ API is not responding. Please start the backend server first." -ForegroundColor Red
    Write-Host "   Run: cd apps/api && npm start" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Step 2: Test chart generation
Write-Host "STEP 2: Chart Generation Test" -ForegroundColor Magenta
Write-Host "----------------------------" -ForegroundColor Magenta

$chartBody = @{
    birth_data = @{
        date = "1990-05-15"
        time = "14:30"
        latitude = 40.7128
        longitude = -74.0060
        timezone = -5
    }
}

$chartData = Test-AudioGeneration -endpoint "/api/charts/generate" -description "Chart Generation" -body $chartBody

if (-not $chartData) {
    Write-Host "❌ Chart generation failed. Cannot proceed with audio tests." -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Test audio generation endpoints
Write-Host "STEP 3: Audio Generation Endpoints" -ForegroundColor Magenta
Write-Host "----------------------------------" -ForegroundColor Magenta

# Test daily audio endpoint
$dailyAudioData = Test-AudioGeneration -endpoint "/api/audio/daily" -description "Daily Audio Generation" -body @{
    genre = "ambient"
    duration = 30
}

Write-Host ""

# Test sequential audio endpoint
$sequentialBody = @{
    chart_data = $chartData.data.chart
    mode = "moments"
}

$sequentialData = Test-AudioGeneration -endpoint "/api/audio/sequential" -description "Sequential Audio Generation" -body $sequentialBody

Write-Host ""

# Step 4: Test browser audio capabilities
Write-Host "STEP 4: Browser Audio Capabilities" -ForegroundColor Magenta
Write-Host "-----------------------------------" -ForegroundColor Magenta

Test-BrowserAudio
Write-Host ""

Test-ToneJS
Write-Host ""

# Step 5: Test frontend audio integration
Write-Host "STEP 5: Frontend Audio Integration" -ForegroundColor Magenta
Write-Host "-----------------------------------" -ForegroundColor Magenta

Write-Host "🌐 Testing frontend audio integration..." -ForegroundColor Yellow

try {
    $frontendResponse = Invoke-WebRequest -Uri "$WEB_BASE" -Method GET -TimeoutSec 10
    Write-Host "   ✅ Frontend is accessible: $($frontendResponse.StatusCode)" -ForegroundColor Green
    
    Write-Host "   📋 Next steps:" -ForegroundColor Cyan
    Write-Host "   1. Open $WEB_BASE in your browser" -ForegroundColor Yellow
    Write-Host "   2. Open DevTools (F12)" -ForegroundColor Yellow
    Write-Host "   3. Go to Console tab" -ForegroundColor Yellow
    Write-Host "   4. Try to generate audio and check for errors" -ForegroundColor Yellow
    Write-Host "   5. Check Network tab for failed requests" -ForegroundColor Yellow
    
} catch {
    Write-Host "   ❌ Frontend not accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   💡 Start the frontend with: cd apps/web && npm run dev" -ForegroundColor Yellow
}

Write-Host ""

# Step 6: Summary and recommendations
Write-Host "STEP 6: Summary & Recommendations" -ForegroundColor Magenta
Write-Host "----------------------------------" -ForegroundColor Magenta

Write-Host "🔍 Debugging Summary:" -ForegroundColor Cyan
Write-Host "   • API Health: $(if ($apiHealthy) { '✅ Working' } else { '❌ Failed' })" -ForegroundColor $(if ($apiHealthy) { 'Green' } else { 'Red' })
Write-Host "   • Chart Generation: $(if ($chartData) { '✅ Working' } else { '❌ Failed' })" -ForegroundColor $(if ($chartData) { 'Green' } else { 'Red' })
Write-Host "   • Audio Generation: $(if ($dailyAudioData -or $sequentialData) { '✅ Working' } else { '❌ Failed' })" -ForegroundColor $(if ($dailyAudioData -or $sequentialData) { 'Green' } else { 'Red' })

Write-Host ""
Write-Host "🎯 Most Likely Issues:" -ForegroundColor Yellow
Write-Host "   1. Browser autoplay restrictions (most common)" -ForegroundColor Red
Write-Host "   2. AudioContext not initialized properly" -ForegroundColor Red
Write-Host "   3. Tone.js not loading or initializing" -ForegroundColor Red
Write-Host "   4. Audio files not being generated correctly" -ForegroundColor Red
Write-Host "   5. CORS issues with audio file access" -ForegroundColor Red

Write-Host ""
Write-Host "🛠️  Immediate Fixes to Try:" -ForegroundColor Green
Write-Host "   1. Test the browser audio files created above" -ForegroundColor Cyan
Write-Host "   2. Ensure user interaction before audio playback" -ForegroundColor Cyan
Write-Host "   3. Check browser console for errors" -ForegroundColor Cyan
Write-Host "   4. Verify audio files are being generated on backend" -ForegroundColor Cyan
Write-Host "   5. Test with different browsers" -ForegroundColor Cyan

Write-Host ""
Write-Host "📋 Next Steps:" -ForegroundColor Green
Write-Host "   1. Run the browser tests above" -ForegroundColor Yellow
Write-Host "   2. Check browser console for specific errors" -ForegroundColor Yellow
Write-Host "   3. Test with user interaction (click buttons)" -ForegroundColor Yellow
Write-Host "   4. Verify audio files exist in backend /public/audio/ directory" -ForegroundColor Yellow

Write-Host ""
Write-Host "🎵 Audio debugging complete!" -ForegroundColor Green 
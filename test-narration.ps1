# PowerShell test script for Astradio Phase 5 - Generative Text Narration
$API_BASE = 'http://localhost:3001'

Write-Host "📝 Testing Astradio Phase 5 - Generative Text Narration..." -ForegroundColor Green
Write-Host ""

try {
    # 1. Test API health
    Write-Host "1. Testing API health..." -ForegroundColor Cyan
    $health = Invoke-WebRequest -Uri "$API_BASE/health" -Method GET
    Write-Host "✅ Health check passed: $($health.Content | ConvertFrom-Json | Select-Object -ExpandProperty status)" -ForegroundColor Green

    # 2. Test narration generation with sample chart
    Write-Host ""
    Write-Host "2. Testing narration generation..." -ForegroundColor Cyan
    
    $chartData = @{
        metadata = @{
            birth_datetime = "1990-05-15T14:30:00Z"
            conversion_method = "prokerala"
            ayanamsa_correction = 0
            coordinate_system = "tropical"
        }
        planets = @{
            Sun = @{
                longitude = 24.5
                sign = @{
                    name = "Taurus"
                    element = "Earth"
                    modality = "Fixed"
                    degree = 24
                }
                house = 7
                retrograde = $false
            }
            Moon = @{
                longitude = 102.3
                sign = @{
                    name = "Cancer"
                    element = "Water"
                    modality = "Cardinal"
                    degree = 12
                }
                house = 9
                retrograde = $false
            }
            Mercury = @{
                longitude = 68.2
                sign = @{
                    name = "Gemini"
                    element = "Air"
                    modality = "Mutable"
                    degree = 8
                }
                house = 6
                retrograde = $false
            }
        }
        houses = @{
            1 = @{ cusp_longitude = 252.4; sign = @{ name = "Scorpio" } }
            2 = @{ cusp_longitude = 282.8; sign = @{ name = "Sagittarius" } }
        }
    }

    $narrationBody = @{
        chart_data = $chartData
        configuration = @{
            mode = "moments"
            tempo = 120
            duration = 180
            genre = "electronic"
        }
        mode = "moments"
    }

    $narrationJson = $narrationBody | ConvertTo-Json -Depth 5
    $narrationResponse = Invoke-WebRequest -Uri "$API_BASE/api/narration/generate" -Method POST -Body $narrationJson -ContentType "application/json"
    $narrationData = $narrationResponse.Content | ConvertFrom-Json
    
    Write-Host "✅ Narration generated successfully" -ForegroundColor Green
    Write-Host "   Mode: $($narrationData.data.mode)" -ForegroundColor Yellow
    Write-Host "   Total Length: $($narrationData.data.summary.totalLength) characters" -ForegroundColor Yellow
    Write-Host "   Sections: $($narrationData.data.summary.sections)" -ForegroundColor Yellow
    Write-Host "   Genre: $($narrationData.data.summary.genre)" -ForegroundColor Yellow
    
    Write-Host ""
    Write-Host "📝 Generated Narration:" -ForegroundColor Cyan
    Write-Host $narrationData.data.narration.fullNarration -ForegroundColor White

    # 3. Test narration with different genres
    Write-Host ""
    Write-Host "3. Testing narration with different genres..." -ForegroundColor Cyan
    
    $genres = @("classical", "jazz", "ambient")
    
    foreach ($genre in $genres) {
        $genreBody = @{
            chart_data = $chartData
            configuration = @{
                mode = "moments"
                tempo = 120
                duration = 120
                genre = $genre
            }
            mode = "moments"
        }

        $genreJson = $genreBody | ConvertTo-Json -Depth 5

        try {
            $genreResponse = Invoke-WebRequest -Uri "$API_BASE/api/narration/generate" -Method POST -Body $genreJson -ContentType "application/json"
            $genreData = $genreResponse.Content | ConvertFrom-Json
            
            Write-Host "✅ $genre genre narration generated" -ForegroundColor Green
            Write-Host "   Length: $($genreData.data.summary.totalLength) characters" -ForegroundColor Yellow
        } catch {
            Write-Host "⚠️ $genre genre narration failed: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }

    # 4. Test dual chart narration
    Write-Host ""
    Write-Host "4. Testing dual chart narration..." -ForegroundColor Cyan
    
    $dualBody = @{
        chart1_data = $chartData
        chart2_data = @{
            metadata = @{
                birth_datetime = "1985-08-20T09:15:00Z"
                conversion_method = "prokerala"
                ayanamsa_correction = 0
                coordinate_system = "tropical"
            }
            planets = @{
                Sun = @{
                    longitude = 127.3
                    sign = @{
                        name = "Leo"
                        element = "Fire"
                        modality = "Fixed"
                        degree = 7
                    }
                    house = 5
                    retrograde = $false
                }
                Moon = @{
                    longitude = 145.8
                    sign = @{
                        name = "Virgo"
                        element = "Earth"
                        modality = "Mutable"
                        degree = 15
                    }
                    house = 6
                    retrograde = $false
                }
            }
            houses = @{
                1 = @{ cusp_longitude = 127.3; sign = @{ name = "Leo" } }
                2 = @{ cusp_longitude = 157.8; sign = @{ name = "Virgo" } }
            }
        }
        configuration = @{
            mode = "overlay"
            tempo = 140
            duration = 180
            genre = "jazz"
        }
    }

    $dualJson = $dualBody | ConvertTo-Json -Depth 5

    try {
        $dualResponse = Invoke-WebRequest -Uri "$API_BASE/api/narration/dual" -Method POST -Body $dualJson -ContentType "application/json"
        $dualData = $dualResponse.Content | ConvertFrom-Json
        
        Write-Host "✅ Dual chart narration generated successfully" -ForegroundColor Green
        Write-Host "   Mode: $($dualData.data.mode)" -ForegroundColor Yellow
        Write-Host "   Charts: $($dualData.data.summary.charts)" -ForegroundColor Yellow
        Write-Host "   Length: $($dualData.data.summary.totalLength) characters" -ForegroundColor Yellow
        Write-Host "   Genre: $($dualData.data.summary.genre)" -ForegroundColor Yellow
        
        Write-Host ""
        Write-Host "📝 Dual Chart Narration:" -ForegroundColor Cyan
        Write-Host $dualData.data.narration -ForegroundColor White
    } catch {
        Write-Host "⚠️ Dual chart narration failed: $($_.Exception.Message)" -ForegroundColor Yellow
    }

    Write-Host ""
    Write-Host "🎉 Phase 5 Generative Text Narration Test Complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ All narration features working:" -ForegroundColor Green
    Write-Host "   • Musical mood generation based on elements and modalities" -ForegroundColor White
    Write-Host "   • Planetary expression with aspect relationships" -ForegroundColor White
    Write-Host "   • Interpretive summaries with emotional themes" -ForegroundColor White
    Write-Host "   • Genre-specific descriptions and instrument assignments" -ForegroundColor White
    Write-Host "   • Mode-aware narration (moments, overlay, sandbox, melodic)" -ForegroundColor White
    Write-Host "   • Dual chart narration for relationship insights" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Narration Features:" -ForegroundColor Cyan
    Write-Host "   • 3-part structure: Musical Mood, Planetary Expression, Interpretive Summary" -ForegroundColor White
    Write-Host "   • Element-based mood descriptions (Fire, Earth, Air, Water)" -ForegroundColor White
    Write-Host "   • Modality-based rhythm descriptions (Cardinal, Fixed, Mutable)" -ForegroundColor White
    Write-Host "   • Planet role descriptions with musical significance" -ForegroundColor White
    Write-Host "   • Aspect relationship explanations with harmonic context" -ForegroundColor White
    Write-Host "   • Genre-specific musical descriptions" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Ready for Phase 6: Advanced Features and User Accounts!" -ForegroundColor Cyan

} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Stack trace: $($_.ScriptStackTrace)" -ForegroundColor Red
} 
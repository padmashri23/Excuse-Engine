$path = 'C:\Users\padma\.gemini\antigravity\brain\2b55b34c-b0be-4368-a935-4d838c745c94\emergent-vs-lovable-vs-replit-blog.md'
$content = [System.IO.File]::ReadAllText($path)
$newcontent = $content.Replace('  -  ', ' - ')
[System.IO.File]::WriteAllText($path, $newcontent)
Write-Host "Done - cleaned up spacing"

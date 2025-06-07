$RevList = & git rev-list --objects --all
$RevList | ForEach-Object {
    $hash, $name = $_ -split '\s+', 2
    if ($name) {
        $size = & git cat-file -s $hash
        [PSCustomObject]@{
            Hash = $hash
            Size = $size
            Name = $name
        }
    }
} | Sort-Object -Property Size -Descending | Select-Object -First 50 | Format-Table -AutoSize

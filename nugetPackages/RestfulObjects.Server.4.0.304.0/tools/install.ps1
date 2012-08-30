param($installPath, $toolsPath, $package, $project)


function CountSolutionFilesByExtension($project, $extension) {
	$files = $project.DTE.Solution `
		| ?{ $_.FileName } `
		| %{ [System.IO.Path]::GetDirectoryName($_.FileName) } `
		| %{ [System.IO.Directory]::EnumerateFiles($_, "*." + $extension, [System.IO.SearchOption]::AllDirectories) }
	($files | Measure-Object).Count
}

if ((CountSolutionFilesByExtension $project csproj) -eq 0) { throw "Must be installed in a C# project" }
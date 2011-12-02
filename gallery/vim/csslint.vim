"=============================================================================
"  Author:          yicuan - http://plafer.tk/
"  Email:           bolasblack [at] gmail
"  FileName:        csslint.vim
"  Description:     based on csslint of nodejs, check your own css code
"  Version:         0.1
"  LastChange:      2011-11-25
"  History:         be created at 2011-11-25
"=============================================================================

if !has('python')
    finish
endif

noremap <silent> <leader>cj :call s:CSSLint_Jump("next")<cr>
noremap <silent> <leader>ck :call s:CSSLint_Jump("prev")<cr>
noremap <silent> <leader>cf :call s:CSSLint_Refresh()<cr>

command! CSSLintRefresh :call s:CSSLint_Refresh()

"autocmd CursorHold,CursorHoldI <buffer> call s:CSSLint_Refresh()
"autocmd InsertLeave <buffer> call s:CSSLint_Refresh()
autocmd BufEnter,BufWritePost <buffer> call s:CSSLint_Refresh()
autocmd BufLeave <buffer> call s:CSSLint_Clear()
autocmd CursorMoved <buffer> call s:CSSLint_GetMessage()

let b:csslint_showingMessage = 0
if !exists("g:CSSLint_HighlightErrorLine")
    let g:CSSLint_HighlightErrorLine = 1
endif
if !exists("g:CSSLint_FileTypeList")
    let g:CSSLint_FileTypeList = ['css', 'less']
endif
" TODO: csslint 的检测有不少参数，应该可以设置
"
"

"by jayli begin
"

function s:ToggleCSSHightError()
	if g:CSSLint_HighlightErrorLine == 0
		let g:CSSLint_HighlightErrorLine = 1
		call s:CSSLint()
	else
		let g:CSSLint_HighlightErrorLine = 0
		call s:CSSLint_Clear()
	endif
endfun

command ToggleCSSHightError :call s:ToggleCSSHightError()


let g:CSSLint_HighlightErrorLine = 0 

"F4来激发/撤销语法检查
au BufRead,BufNewFile *.css noremap <F4> :ToggleCSSHightError<CR> 
au BufRead,BufNewFile *.less noremap <F4> :ToggleCSSHightError<CR> 
""""by jayli end




function! s:CSSLint()
    if index(g:CSSLint_FileTypeList, &filetype) == -1
        return
    endif

    highlight link CSSLintError SpellBad

    if exists("b:csslint_cleared")
        if b:csslint_cleared == 0
            call s:CSSLint_Clear()
        endif
    endif

    let b:csslint_matched = []
    let b:csslint_matchedLines = {}

    " Detect range
    if a:firstline == a:lastline
        let b:firstline = 1
        let b:lastline = '$'
    else 
        let b:firstline = a:firstline
        let b:lastline = a:lastline
    endif

    if executable('csslint')
        let current_file = expand('%:p')
        let s:cmd = 'csslint --format=checkstyle-xml ' . iconv( current_file , &enc, "utf8")
        let l:csslint_output = system(s:cmd)
        call s:CSSLint_ListEncode(l:csslint_output)
    else
        if v:shell_error
             echoerr 'could not invoke cssLint!'
        end
    endif
endfunction

function! s:CSSLint_Clear()
    " Delete previous matches
    let s:csslint_matcheList = getmatches()
    for s:csslint_matcheDict in s:csslint_matcheList
      if s:csslint_matcheDict['group'] == 'CSSLintError'
          call matchdelete(s:csslint_matcheDict['id'])
      endif
    endfor
    let b:csslint_matched = []
    let b:csslint_matchedLines = {}
    let b:csslint_cleared = 1
endfunction

function! s:CSSLint_WideMsg(msg)
" TODO: 显示的时候，如果信息太长会需要按 ENTER，想办法解决这个问题
    let x=&ruler | let y=&showcmd
    set noruler noshowcmd
    redraw
    echo a:msg
    let &ruler=x | let &showcmd=y
endfun

function! s:CSSLint_ListEncode(lintXmlString)
python << EOF
import vim 
import xml.dom.minidom as minidom

lintXmlString = vim.eval('a:lintXmlString').replace('&', '&amp;')
errors = minidom.parseString(lintXmlString)
for error in errors.getElementsByTagName('error'):
    line = error.getAttribute('line')
    column = error.getAttribute('column')
    level = error.getAttribute('severity')
    message = error.getAttribute('message')
    message = message[:message.find(' at line')]
    message = message + ' at col ' + column
    vim.command('let s:csslint_matchDict = { \
        "line": "' + line + '",              \
        "column": "' + column + '",          \
        "level": "' + level + '",            \
        "message": "' + message + '"         \
    }')
    vim.command('let b:csslint_matchedLines[' + line + '] = s:csslint_matchDict')
    vim.command('call add(b:csslint_matched, s:csslint_matchDict)')
    if vim.eval('g:CSSLint_HighlightErrorLine') == '1':
        vim.command('call matchadd("CSSLintError", "\\\%" . ' + line + r' . "l\\S.*\\(\\S\\|$\\)")')
EOF
    highlight link CSSLintError SpellBad
    let b:csslint_cleared = 0
endfunction

function! s:CSSLint_GetMessage()
    let s:cursorPos = getpos(".")

    " Bail if RunCSSLint hasn't been called yet
    if !exists('b:csslint_matchedLines')
        return
    endif

    if has_key(b:csslint_matchedLines, s:cursorPos[1])
        let s:cssLint_match = get(b:csslint_matchedLines, s:cursorPos[1])
        let s:cursorPos[2] = s:cssLint_match['column']
        call s:CSSLint_WideMsg(s:cssLint_match['message'])
        let b:csslint_showingMessage = 1
        return
    endif

    if b:csslint_showingMessage == 1
        echo
        let b:csslint_showingMessage = 0
    endif
endfunction

function! s:CSSLint_Refresh()
    silent call s:CSSLint()
    call s:CSSLint_GetMessage()
endfunction

function! s:CSSLint_Jump(direction)
    let cursorPos = getpos(".")

    if !exists('b:csslint_matchedLines')
        return
    endif

    let currentLine = s:cursorPos[1]
    let lines = keys(b:csslint_matchedLines)

    let temp = []
    for line in lines
        let line = line + 0
        call add(temp, line)
    endfo

    if index(temp, currentLine) == -1
        call add(temp, currentLine)
    endif

    func! s:AscCompare(i1, i2)
        return a:i1 == a:i2 ? 0 : a:i1 > a:i2 ? 1 : -1
    endfunc
    call sort(temp, "s:AscCompare")

    let lines = temp
    let b:lintLines = lines

    let currentIndex = index(lines, currentLine)

    if a:direction == "next"
        let nextErrorLine = get(lines, currentIndex + 1, lines[0])
    elseif a:direction == "prev"
        "如果成为负数，vim 能自动处理
        let nextErrorLine = get(lines, currentIndex - 1)
    else
        let nextErrorLine = a:direction
    endif

    call cursor(nextErrorLine, 0)
endfunction




#将所有的文件进行unicode转码

# isEnc file.name gbk && echo 'gbk'
# isEnc file.name utf8 && echo 'utf8'
isEnc () {
	local temp=`iconv -f $2 $1 1>/dev/null 2>/dev/null && echo 'true'`;
	if [ "$temp" = 'true' ]; then
		return 0;
	fi;
	return 1;
}

find . -name "*.css"  > cssminfiles
find . -name "*.js" >> cssminfiles

while read line
	do

		isEnc ${line} gb18030 && iconv -f GB18030 -t UTF-8 ${line} -o ${line}.tmp
		isEnc ${line} utf8 && cp ${line} ${line}.tmp

#		isEnc ${line} utf8 && iconv -f UTF-8 -t GB18030 ${line} -o ${line}.tmp
		native2ascii ${line}.tmp ${line}.tmp2
		mv ${line}.tmp2 ${line}
		rm ${line}.tmp
		echo '>>>'${line}
done < cssminfiles

rm cssminfiles





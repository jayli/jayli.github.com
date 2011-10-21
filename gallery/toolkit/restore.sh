

# by 拔赤
# 将所有-min.js和-min.css覆盖源文件，放置kissy里混乱的编码约定导致的干扰
# sh ./restore.sh


find . -name "*.css" | awk '{if(/-min\.css/)print $0}'  > cssminfiles

while read line
	do
		cssfile=${line%-min*}
		eval `cp $line $cssfile.css`
done < cssminfiles

rm cssminfiles





find . -name "*.js" | awk '{if(/-min\.js/)print $0}'  > jsminfiles

while read line
	do
		jsfile=${line%-min*}
		eval `cp $line $jsfile.js`
done < jsminfiles

rm jsminfiles

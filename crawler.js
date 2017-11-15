import http from 'http'
import cheerio from 'cheerio'

const url = 'http://www.imooc.com/learn/348'

function filterChapters(html){
	const $ = cheerio.load(html)

	let chapters = $('.chapter')
	
	let courseData = []
	chapters.each(function(item){
		let chapter = $(this)
		chapter.find('.chapter-introubox').remove()
		let	chapterTitle = chapter.find('strong').text().trim(),
			videos = chapter.find('.video').children(),
			chapterData = {
				chapterTitle: chapterTitle,
				videos: []
			}
		videos.each(function(item){
			let video = $(this).find('.J-media-item')
			video.find('.preview-btn').remove()
			let	videoTitle = video.text().trim(),
				id = video.attr('href').split('video/')[1]
			chapterData.videos.push({
				title: videoTitle,
				id: id
			})
		})
		courseData.push(chapterData)
	})
	return courseData
}

function printCourseInfo(courseData){
	courseData.forEach(function(item){
		let chapterTitle = item.chapterTitle
		console.log(`${chapterTitle}\n`)
		item.videos.forEach(function(video){
			console.log(`【${video.id}】${video.title}\n`)
		})
	})
}

http.get(url, function(res){
	let html = ''
	res.on('data', function(data){
		html += data
	})
	res.on('end', function(){
		let courseData = filterChapters(html)
		printCourseInfo(courseData)
	})
	res.on('error', function(){
		console.log('获取课程数据出错！')
	})
})
import http from 'http'
import cheerio from 'cheerio'

class ImoocCrawler {
	constructor(url) {
		this.url = url
	}

	getData() {
		http.get(this.url, (res) => {
			let html = ''

			res.on('data', (data) => {
				html += data
			})
			res.on('end', () => {
				let courseData = this.filterChapters(html)

				this.printCourseInfo(courseData)
			})
			res.on('error', () => {
				console.log(`获取课程数据出错！`)
			})
		})
	}

	filterChapters(html) {
		let $ = cheerio.load(html),
			chapters = $('.chapter'),
			courseData = []

		chapters.map(function(){
			let chapter = $(this)

			chapter.find('.chapter-introubox').remove()

			let	chapterTitle = chapter.find('strong').text().trim(),
				videos = chapter.find('.video').children(),
				chapterData = {chapterTitle: chapterTitle, videos: []}

			videos.map(function(){
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

	printCourseInfo(courseData) {
		for(let item of courseData){
			let chapterTitle = item.chapterTitle

			console.log(`${chapterTitle}\n`)

			for(let video of item.videos){
				console.log(`【${video.id}】${video.title}\n`)
			}
		}
	}
}

const crawler = new ImoocCrawler('http://www.imooc.com/learn/348')
crawler.getData()



/*ES5*/

// var http = require('http')
// var cheerio = require('cheerio')

// var url = 'http://www.imooc.com/learn/348'

// function filterChapters(html){
// 	var $ = cheerio.load(html)

// 	var chapters = $('.chapter')
	
// 	var courseData = []
// 	chapters.each(function(index, item){
// 		var chapter = $(this)
// 		chapter.find('.chapter-introubox').remove()
// 		var	chapterTitle = chapter.find('strong').text().trim(),
// 			videos = chapter.find('.video').children(),
// 			chapterData = {
// 				chapterTitle: chapterTitle,
// 				videos: []
// 			}
// 		videos.each(function(index, item){
// 			var video = $(this).find('.J-media-item')
// 			video.find('.preview-btn').remove()
// 			var	videoTitle = video.text().trim(),
// 				id = video.attr('href').split('video/')[1]
// 			chapterData.videos.push({
// 				title: videoTitle,
// 				id: id
// 			})
// 		})
// 		courseData.push(chapterData)
// 	})
// 	return courseData
// }

// function printCourseInfo(courseData){
// 	courseData.forEach(function(item){
// 		var chapterTitle = item.chapterTitle
// 		console.log(chapterTitle + '\n')
// 		item.videos.forEach(function(video){
// 			console.log('【' + video.id + '】' + video.title + '\n')
// 		})
// 	})
// }

// http.get(url, function(res){
// 	var html = ''
// 	res.on('data', function(data){
// 		html += data
// 	})
// 	res.on('end', function(){
// 		var courseData = filterChapters(html)
// 		printCourseInfo(courseData)
// 	})
// 	res.on('error', function(){
// 		console.log('获取课程数据出错！')
// 	})
// })

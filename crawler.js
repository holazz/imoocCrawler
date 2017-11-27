// import http from 'http'
// import cheerio from 'cheerio'

// class ImoocCrawler {
// 	constructor(url) {
// 		this.url = url
// 	}

// 	getData() {
// 		http.get(this.url, (res) => {
// 			let html = ''

// 			res.on('data', (data) => {
// 				html += data
// 			})
// 			res.on('end', () => {
// 				let courseData = this.filterChapters(html)

// 				this.printCourseInfo(courseData)
// 			})
// 			res.on('error', () => {
// 				console.log(`获取课程数据出错！`)
// 			})
// 		})
// 	}

// 	filterChapters(html) {
// 		let $ = cheerio.load(html),
// 			chapters = $('.chapter'),
// 			courseData = []

// 		chapters.map(function(){
// 			let chapter = $(this)

// 			chapter.find('.chapter-introubox').remove()

// 			let	chapterTitle = chapter.find('strong').text().trim(),
// 				videos = chapter.find('.video').children(),
// 				chapterData = {chapterTitle: chapterTitle, videos: []}

// 			videos.map(function(){
// 				let video = $(this).find('.J-media-item')

// 				video.find('.preview-btn').remove()

// 				let	videoTitle = video.text().trim(),
// 					id = video.attr('href').split('video/')[1]

// 				chapterData.videos.push({
// 					title: videoTitle,
// 					id: id
// 				})
// 			})

// 			courseData.push(chapterData)
// 		})

// 		return courseData
// 	}

// 	printCourseInfo(courseData) {
// 		for(let item of courseData){
// 			let chapterTitle = item.chapterTitle

// 			console.log(`${chapterTitle}\n`)

// 			for(let video of item.videos){
// 				console.log(`【${video.id}】${video.title}\n`)
// 			}
// 		}
// 	}
// }

// const crawler = new ImoocCrawler('http://www.imooc.com/learn/348')
// crawler.getData()




import http from 'http'
import cheerio from 'cheerio'

const baseUrl = 'http://www.imooc.com/learn/'
const dataUrl = 'http://www.imooc.com/course/AjaxCourseMembers?ids='
//const videoIds = [75, 134, 197, 259, 348, 637, 728]
class ImoocCrawler {

	filterChapters(html) {
		let $ = cheerio.load(html),
			chapters = $('.chapter'),
			title = $('.course-infos .path span').text(),
			number = Number.parseInt($('.statics .js-learn-num').text()),
			courseData = {
				title: title,
				number: number,
				videos: []
			}
			
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

			courseData.videos.push(chapterData)
		})

		return courseData
	}

	printCourseInfo(coursesData) {
		for(let courseData of coursesData){
			console.log(`${courseData.number}人学过${courseData.title}\n`)
			console.log(`### ${courseData.title}\n`)

			for(let item of courseData.videos){
				let chapterTitle = item.chapterTitle

				console.log(`${chapterTitle}\n`)

				for(let video of item.videos){
					console.log(`【${video.id}】${video.title}\n`)
				}
			}
		}


	}

	getPageAsync(url) {
		return new Promise((resolve, reject) => {
			console.log(`正在爬取 ${url}\n`)

			http.get(url, res => {
				let html = ''

				res.on('data', data => {
					html += data
				})
				res.on('end', () => {
					resolve(html)
				})
				res.on('error', e => {
					reject(e)
					console.log(`获取课程数据出错！`)
				})
			})
		})
	}

	getData(videoIds) {
		let fetchCourseArray = []
		if(typeof videoIds === 'object'){
			for(let id of videoIds){
				fetchCourseArray.push(this.getPageAsync(baseUrl + id))

				http.get(dataUrl + id, res => {
					let numObj = {}

					res.on('data', data => {
						Object.assign(numObj, JSON.parse(data.toString()))
					})
					res.on('end', () => {
						console.log(numObj.data[0].numbers)
					})
					res.on('error', e => {
						console.log(e)
					})
				})
			}
		}else{
			fetchCourseArray.push(this.getPageAsync(baseUrl + videoIds))

			http.get(dataUrl + videoIds, res => {
					let numObj = {}

					res.on('data', data => {
						Object.assign(numObj, JSON.parse(data.toString()))
					})
					res.on('end', () => {
						console.log(numObj.data[0].numbers)
					})
					res.on('error', e => {
						console.log(e)
					})
				})
			
			
		}
		
		Promise.all(fetchCourseArray)
			.then(pages => {
				let coursesData = []

				for(let html of pages){
					let courseData = this.filterChapters(html)
					coursesData.push(courseData)
				}
				
				coursesData.sort((a, b) => a.number < b.number)
				this.printCourseInfo(coursesData)
			})
	}

}

const crawler = new ImoocCrawler()
crawler.getData([75, 134])



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


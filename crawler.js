import http from 'http'
import cheerio from 'cheerio'

class ImoocCrawler {
	constructor(){
		this.baseUrl = 'http://www.imooc.com/learn/'
		this.dataUrl = 'http://www.imooc.com/course/AjaxCourseMembers?ids='
	}

	/**
	 * @method filterChapters 格式化课程数据
	 * @param  {String} html 单个课程页面
	 * @return {Array} courseData 单个课程页面数据
	 */
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
	
	/**
	 * @method printCourseInfo 打印课程信息
	 * @param  {Array} coursesData 单个课程页面数据
	 */
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

	/**
	 * @method getPageAsync 获取课程页面
	 * @param  {String} url 课程地址
	 */
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
	
	/**
	 * @method getNumberAsync 获取学习人数
	 * @param  {String} url ajax请求获取学习课程人数的地址
	 */
	getNumberAsync(url){
		return new Promise((resolve, reject) => {
			http.get(url, res => {
				let numObj = {}

				res.on('data', data => {
					Object.assign(numObj, JSON.parse(data.toString()))
				})
				res.on('end', () => {
					resolve(numObj.data[0].numbers)
				})
				res.on('error', e => {
					reject(e)
					console.log(e)
				})
			})
		})
	}

	/**
	 * @method getData 异步获取课程数据
	 * @param  {Array or String} videoIds 课程ID
	 */
	async getData(videoIds) {
		let fetchCourseArray = [],
			ajaxNumber = []

		if(typeof videoIds === 'object'){
			for(let id of videoIds){
				fetchCourseArray.push(this.getPageAsync(this.baseUrl + id))
				ajaxNumber.push(this.getNumberAsync(this.dataUrl + id))
			}
		}else{
			fetchCourseArray.push(this.getPageAsync(this.baseUrl + videoIds))
			ajaxNumber.push(this.getNumberAsync(this.dataUrl + videoIds))
		}

		try{
			let pages = await Promise.all(fetchCourseArray),
				number = await Promise.all(ajaxNumber)
			
			let coursesData = []

			for(let [index, html] of pages.entries()){
				let courseData = this.filterChapters(html)
				courseData.number = number[index]
				coursesData.push(courseData)
			}
			
			coursesData.sort((a, b) => a.number < b.number)
			this.printCourseInfo(coursesData)
		}catch(err){
			console.log(err)
		}		
	}

}

const crawler = new ImoocCrawler()

const videoIds = [75, 134, 197, 259, 348, 637, 728]
crawler.getData(videoIds)



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


#!/usr/bin/env node

const { prompt } = require('enquirer')
const dayjs = require('dayjs')
const Table = require('cli-table3')
const open = require('open')
const { google } = require('googleapis')
const scope = 'https://www.googleapis.com/auth/calendar.events'
const authentication = new google.auth.GoogleAuth({ keyFile: process.env.CREDENTIAL_KEY_FILE, scopes: [scope] })
const calendar = google.calendar({ version: 'v3', authentication })

class Googler {
  constructor () {
    this.calenderId = process.env.CALENDAR_ID
    this.timezone = process.env.TIMEZONE
  }

  addEvent () {
    const questions = [
      {
        type: 'input',
        name: 'summary',
        message: 'Enter the schedule summary:'
      },
      {
        type: 'input',
        name: 'start',
        message: 'Enter the start time on your schedule (YYYY-MM-DD hh:mm):',
        hint: 'YYYY-MM-DD hh:mm',
        validate: (inputValue) => {
          if (dayjs(inputValue).isValid()) {
            return true
          } else {
            return 'input value is not valid.'
          }
        }
      },
      {
        type: 'input',
        name: 'end',
        message: 'Enter the end time on your schedule (YYYY-MM-DD hh:mm):',
        hint: 'YYYY-MM-DD hh:mm',
        validate: (inputValue) => {
          if (dayjs(inputValue).isValid()) {
            return true
          } else {
            return 'input value is not valid.'
          }
        }
      }
    ]

    prompt(questions)
      .then(({ summary, start, end }) => {
        const startTime = dayjs(start).toDate()
        const endTime = dayjs(end).toDate()
        const event = {
          summary,
          start: {
            dateTime: startTime,
            timeZone: this.timezone
          },
          end: {
            dateTime: endTime,
            timeZone: this.timezone
          }
        }

        calendar.events.insert({
          auth: authentication,
          calendarId: this.calenderId,
          resource: event
        }, function (err, event) {
          if (err) {
            console.log('\n' + '🐱 < There was an error contacting the Calendar service: ' + err + '\n')
            return
          }
          console.log('\n' + '🐱 < Event created successfully!: %s', event.data.summary + '\n')
          open(event.data.htmlLink)
        })
      })
      .catch(console.error)
  }

  editEvent () {
    const questions = [
      {
        type: 'input',
        name: 'eventId',
        message: 'Enter the event id you want to update:'
      },
      {
        type: 'input',
        name: 'summary',
        message: 'Enter the schedule summary if you want to update:'
      },
      {
        type: 'input',
        name: 'start',
        message: 'Enter the start time on your schedule if you want to update (YYYY-MM-DD hh:mm):',
        hint: 'YYYY-MM-DD hh:mm',
        validate: (inputValue) => {
          if (dayjs(inputValue).isValid() || !inputValue) {
            return true
          } else {
            return 'input value is not valid.'
          }
        }
      },
      {
        type: 'input',
        name: 'end',
        message: 'Enter the end time on your schedule if you want to update (YYYY-MM-DD hh:mm):',
        hint: 'YYYY-MM-DD hh:mm',
        validate: (inputValue) => {
          if (dayjs(inputValue).isValid() || !inputValue) {
            return true
          } else {
            return 'input value is not valid.'
          }
        }
      }
    ]

    prompt(questions)
      .then(({ eventId, summary, start, end }) => {
        const event = calendar.events.get({ auth: authentication, calendarId: this.calenderId, eventId })

        if (summary !== 'undefined') {
          event.summary = summary
        } else if (start !== 'undefined') {
          event.start.dateTime = dayjs(start).toDate()
        } else if (end !== 'undefined') {
          event.end.dateTime = dayjs(end).toDate()
        }

        calendar.events.patch({
          auth: authentication,
          calendarId: this.calenderId,
          eventId,
          resource: event
        }, function (err, event) {
          if (err) {
            console.log('\n' + '🐱 < There was an error contacting the Calendar service: ' + err + '\n')
            return
          }
          console.log('\n' + '🐱 < Event updated successfully!: %s', event.data.summary + '\n')
        })
      })
      .catch(console.error)
  }

  deleteEvent () {
    prompt({
      type: 'input',
      name: 'eventId',
      message: 'Enter event id to delete:'
    }).then(answer => {
      calendar.events.delete({
        auth: authentication,
        calendarId: this.calenderId,
        eventId: answer.eventId
      }, function (err, event) {
        if (err) {
          console.log('\n' + '🐱 < There was an error contacting the Calendar service: ' + err + '\n')
          return
        }
        console.log('\n' + '🐱 < Delete completed!: %s', answer.eventId + '/n')
      })
    })
      .catch(console.error)
  }

  async listEvents () {
    const response = await prompt({
      type: 'input',
      name: 'days',
      message: 'Enter the number of days to display:'
    })

    const today = new Date()
    await calendar.events.list({
      auth: authentication,
      calendarId: this.calenderId,
      timeMin: today,
      timeMax: new Date(today.getFullYear(), today.getMonth(), today.getDate() + parseInt(response.days)),
      singleEvents: true,
      orderBy: 'startTime'
    }, function (err, res) {
      if (err) {
        console.log('\n' + '🐱 < There was an error contacting the Calendar service: ' + err + '\n')
        return
      }

      const events = res.data.items
      if (!events || events.length === 0) {
        console.log('┌───────────────────────────┐\n' +
          '│ No Event. Take a Rest! 💐 │\n' +
          '└───────────────────────────┘')
        return
      }

      const table = new Table({
        head: ['No.', 'Event Id', 'Date', 'Schedule'],
        style: {
          head: [],
          border: []
        }
      })

      events.forEach(function (event, index) {
        const startAt = event.start.dateTime || event.start.date
        table.push([index + 1, event.id, dayjs(startAt).format('YYYY-MM-DD hh:mm'), event.summary])
      })
      console.log('\n' + `🐱 < You have ${events.length} events in ${response.days} days!` + '\n')
      console.log(table.toString())
    })
  }
}

module.exports = Googler

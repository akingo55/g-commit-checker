#!/usr/bin/env node

const { Command } = require('commander')
const program = new Command()
const Googler = require('./googler')

class Cli {
  async run () {
    program
      .option('-l, --list', 'list your calendar')
      .option('-a, --add', 'add a new schedule')
      .option('-d, --delete', 'delete a schedule')
      .option('-e, --edit', 'edit a schedule')
      .parse()

    const option = program.opts()
    const googler = new Googler()

    if (option.list) {
      googler.listEvents()
    } else if (option.add) {
      googler.addEvent()
    } else if (option.delete) {
      googler.deleteEvent()
    } else if (option.edit) {
      googler.editEvent()
    } else {
      program.help()
    }
  }
}

const main = new Cli()
main.run()

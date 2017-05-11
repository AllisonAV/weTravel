import React, { Component } from 'react'
import { Link } from 'react-router'
import firebase from 'APP/fire'
import Timeline from 'react-calendar-timeline'
import moment from 'moment'

// this is where we make our connection to the database, we need:
// user name, user startDate for this trip, user endDate for this trip (currentTripUserStartDate, currentTripUserEndDate)
// loop over buddies in trip and grab info
// From trip (ie. tripRef) we need: buddiesid -> id, buddiesid -> group, availabilityStart -> start_time, availabilityEnd -> end_time
// Note: title in an itemsData group will be the name of a buddy or self

const db = firebase.database()

export default class AdventureUsTimeline extends Component {
  constructor(props) {
    super(props)
    this.state = {
      startTime: moment(),
      endTime: moment().add(1, 'days'),
    }
    this.onItemResize = this.onItemResize.bind(this)
  }
  componentWillMount() {
    // // Getting data from trip part of db
    // let itemsData = [], groupData = []
    // const tripRef = this.props.tripRef
    // const userId = this.props.userId
    // tripRef.on('value', function(snapshot) {
    //   const buddiesObject = snapshot.val().buddies
    //   const buddiesIds = Object.keys(buddiesObject) // do not need this line of code
    //   // now map over the buddies Ids and grab the start and end dates
    //   itemsData = Object.keys(buddiesObject).map((key) => {
    //     return {
    //       id: key,
    //       group: key,
    //       title: buddiesObject[key].name,
    //       start_time: moment(buddiesObject[key].availabilityStart),
    //       end_time: moment(buddiesObject[key].availabilityEnd),
    //       canResize: key === userId ? 'both' : false,
    //       canChangeGroup: false // if we oneday get to items do conditional checks for item categories here
    //     }
    //   }, this)
    //   groupData = Object.keys(buddiesObject).map((key) =>
    //      ({
    //        id: key,
    //        title: buddiesObject[key].name
    //      })
    //   )
    //   groups = groupData
    //   items = itemsData
    // })
  }

  componentWillUnmount() {
    // this.unsubscribe && this.unsubscribe()
  }

  findMinStartDate = (items) => {
    // takes start dates from each buddy and returns the min of these minus 1 day in unix number form casts from 1970 ('* 1000')
    const tempMinDate = items.map(item => item.start_time)
    .reduce((minDate, dateMoment) => {
      return dateMoment < minDate ? dateMoment : minDate
    }, moment().add(10, 'years'))
    const renderMinStartDate = moment(tempMinDate).add(-1, 'days')
    return renderMinStartDate.unix()*1000
  }

  findMaxEndDate = (items) => {
    // takes end dates from each buddy and returns the max of these minus 1 day in unix number form and casts from 1970 ('* 1000')
    const tempMaxDate = items.map(item => item.end_time)
    .reduce((maxDate, dateMoment) => {
      return dateMoment > maxDate ? dateMoment : maxDate
    }, moment())
    const renderMaxEndDate = moment(tempMaxDate).add(1, 'days')
    return renderMaxEndDate.unix()*1000
  }

  onItemResize = (userId, time, edge) => {
    const tripRef = this.props.tripRef
    // we get back the userId, the time changed to in unix number format and the edge that was changed
    // we then set the new time based on what it's changed to.
    const itemArrayIndex = this.props.items.findIndex((item) => item.id === userId)
    if (edge === 'left') {
      const startTime = moment(time)
      // loop through item array and find the item where the id matches the userId, then update the startTime here
      this.props.items[itemArrayIndex].start_time = startTime
      this.findMinStartDate(this.props.items)
      this.setState({startTime: startTime})
      tripRef.child(`buddies/${userId}`).update({availabilityStart: startTime.toJSON()})
    } else {
      const endTime = moment(time)
      this.props.items[itemArrayIndex].end_time = endTime
      this.findMaxEndDate(this.props.items)
      this.setState({endTime: endTime})
      tripRef.child(`buddies/${userId}`).update({availabilityEnd: endTime.toJSON()})
    }
  }

  render() {
// This object sets the untis on the timeline.
// Currently, it is set to display days, months and years
    const timeSteps = {
      second: 0,
      minute: 0,
      hour: 0,
      day: 1,
      month: 1,
      year: 1
    }
    // console.log('TIMELINE, PROPS', this.props)
    return (
      <div className="well">
        <h1>Timeline</h1>
          <Timeline groups={this.props.groups}
            items={this.props.items}
            defaultTimeStart={this.findMinStartDate(this.props.items)}
            defaultTimeEnd={this.findMaxEndDate(this.props.items)}
            timeSteps={timeSteps}
            sidebarWidth={70}
            onItemResize={this.onItemResize}
            />
      </div>
    )
  }
}

// visibleTimeStart={this.findMinStartDate(this.props.items)}
//          visibleTimeEnd={this.findMaxEndDate(this.props.items)}

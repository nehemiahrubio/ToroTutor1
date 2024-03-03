import React, { Component } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { Link } from "react-router-dom";

import {
  createProfile,
  getCurrentProfile,
} from "../../redux/actions/profileActions";
import { getSubjects } from "../../redux/actions/subjectActions";
import AvailabilityForm from "./AvailabilityForm"; // Update the path as needed
import axios from "axios"; // Import axios for making HTTP requests
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";


import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import { FormControl, Input, InputLabel } from "@material-ui/core";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import Button from "@material-ui/core/Button";
import "./profile.css";
import {
  filterArrDuplicates,
  sortArrByAscending,
  filterByOptions,
  findFirstMatch,
} from "../../utils/lodashOps";

class EditProfile extends Component {
  state = {
    major: [],
    bio: "",
    type: "",
    minor: [],
    availability: "",
    courses: [],
    subjects: [],
    errors: {},
    isAvailabilityModalOpen: false,
    events: [],
    profileId: null,
  };

  componentDidMount() {
    this.props.getCurrentProfile();
    this.props.getSubjects();

  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) this.setState({ errors: nextProps.errors });
    if (nextProps.profile.profile) {
      const profile = nextProps.profile.profile;
      const courses = profile.courses.length > 0 ? profile.courses : [];
      this.setState({
        major: profile.major,
        minor: profile.minor,
        bio: profile.bio,
        availability: profile.availability,
        type: profile.type,
        courses: courses,
        events: profile.availability || [],
      });
    }
    if (nextProps.subjects.subjects) {
      this.setState({
        subjects: sortArrByAscending(nextProps.subjects.subjects, ["name"]),
      });
    }
  }

  addCourse = (e) => {
    const newCourse = {
      courseId: "",
      courseName: "",
      courseNumber: "",
      courseSubject: "",
      id: Math.random()
        .toString(36)
        .replace(/[^a-z]+/g, "")
        .substr(2, 10),
    };

    this.setState((prevState) => ({
      courses: [...prevState.courses, newCourse],
    }));
  };

  removeCourse = (id) => {
    let courses = [...this.state.courses];
    const newCourses = courses.filter((course) => {
      return course.id !== id;
    });

    this.setState({
      courses: [...newCourses],
    });

    if (newCourses.length === 0) {
      console.log("No courses");
    }
  };

  numberOnly = (e) => {
    console.log(e.charCode);
    return e.charCode >= 48 && e.charCode <= 57;
  };

  onSubmit = (e) => {
    e.preventDefault();
    const { bio, major, minor, availability, courses, type } = this.state;

    const profileData = {
      bio,
      major,
      minor,
      courses,
      availability,
      type,
    };

    this.props.createProfile(profileData, this.props.history);
  };

  onChange = (e) => {
    const name = e.target.name;
  
    if (
      name.includes("courseId") ||
      name.includes("courseNumber") ||
      name.includes("courseName")
    ) {
      let courses = [...this.state.courses];
      let i = name.charAt(name.length - 1);
      let property = name.substring(0, name.length - 2);
      courses[i][property] = e.target.value;
  
      // if we just set the course ID property, also set the subject name
      if (property === "courseId") {
        let subject = findFirstMatch(this.state.subjects, ["id", e.target.value]);
        courses[i].courseSubject = subject.name;
      }
      this.setState({ courses: courses });
    } else {
      const { major, minor } = this.state;
  
      // Check if the change is related to the availability
      if (name === "availability") {
        // Assuming availability is a string, update accordingly
        this.setState({ availability: e.target.value });
      } else {
        this.setState({ [name]: e.target.value });
  
        if (e.target.name === "major") {
          const filtered = filterArrDuplicates(minor, e.target.value);
          this.setState({ minor: filtered });
        } else if (e.target.name === "minor") {
          const filtered = filterArrDuplicates(major, e.target.value);
          this.setState({ major: filtered });
        }
      }
    }
  };
  openAvailabilityForm = () => {
    this.setState({ isAvailabilityModalOpen: true });
  };

  closeAvailabilityForm = () => {
    this.setState({ isAvailabilityModalOpen: false });
  };

  handleAvailabilitySubmit = () => {
    // Perform validation and handle the submitted availability
    // For now, let's just close the modal

    // Close the modal
    this.closeAvailabilityForm();

    // Get the profile ID from your state or props
    const { profile } = this.props;
    const profileId = profile.profile._id; // Assuming _id is the field containing the profile ID

    // Transform events array into a format suitable for your backend
    const { events } = this.state;
    const availability = events.map(event => ({
      start: event.start.toISOString(),
      end: event.end.toISOString(),
      title: event.title,
    }));

    // Make a request to update availability
    axios.post("/api/profile/update-availability", { profileId, availability })
      .then(response => {
        console.log(response.data); // Log success message or handle as needed
      })
      .catch(error => {
        console.error(error); // Log or handle the error
      });
  };

  handleSlotSelect = ({ start, end }) => {
    const { events } = this.state;
  
    // Convert start and end to Date objects if they are not
    const startDate = start instanceof Date ? start : new Date(start);
    const endDate = end instanceof Date ? end : new Date(end);
  
    // Check if the selected slot already exists
    const existingEventIndex = events.findIndex(
      (event) =>
        event.start instanceof Date &&
        event.end instanceof Date &&
        event.start.getTime() === startDate.getTime() &&
        event.end.getTime() === endDate.getTime()
    );
  
    if (existingEventIndex !== -1) {
      // Slot exists, remove it
      const updatedEvents = [...events];
      updatedEvents.splice(existingEventIndex, 1);
  
      this.setState({
        events: updatedEvents,
      });
    } else {
      // Slot doesn't exist, add a new event
      const newEvent = {
        start: startDate,
        end: endDate,
        title: "Available",
      };
  
      this.setState((prevState) => ({
        events: [...prevState.events, newEvent],
      }));
    }
  };
  

  handleSaveDates = () => {
  // Use this.state.events to save or update the selected dates
  // Make the necessary API calls or update the database
  // For example, you can send this data to the server using axios

  // Get the profile ID from your state or props
  const { profile } = this.props;
  const profileId = profile.profile._id; // Assuming _id is the field containing the profile ID

  // Transform events array into a format suitable for your backend
  const { events } = this.state;
  const availability = events.map(event => {
    // Check if start and end are valid date objects
    const isValidDate = (date) => date instanceof Date && !isNaN(date);

    return {
      start: isValidDate(event.start) ? event.start.toISOString() : new Date().toISOString(),
      end: isValidDate(event.end) ? event.end.toISOString() : new Date().toISOString(),
      title: event.title,
    };
  });

  // Make a request to update availability
  axios.post("/api/profile/update-availability", { profileId, availability })
    .then(response => {
      console.log(response.data); // Log success message or handle as needed

    })
    .catch(error => {
      console.error(error); // Log or handle the error
    });
};

handleDeselect = (info) => {
  const { event } = info;

  // Check if the event has an ID (indicating it was loaded)
  if (event.id) {
    // If the event has an ID, remove it from the state
    const updatedEvents = this.state.events.filter((e) => e.id !== event.id);

    this.setState({
      events: updatedEvents,
    });
  } else {
    // If the event doesn't have an ID, it's a newly added event, so remove it directly
    event.remove();
  }
};

  // on cancel go back to dashboard to eliminate need for extra button
  render() {
    const {
      bio,
      major,
      minor,
      availability,
      courses,
      subjects,
      type,
      events,
    } = this.state;
    const minors = filterByOptions(subjects, ["isMinor", "Yes"]);
    const majors = filterByOptions(subjects, ["isMajor", "Yes"]);
    const subjectItems = filterByOptions(subjects, ["isCourse", "Yes"]);

    const majorMenuItems = majors.map((major, i) => (
      <MenuItem key={i} value={major.name}>
        {major.name}
      </MenuItem>
    ));
    const minorMenuItems = minors.map((minor, i) => (
      <MenuItem key={i} value={minor.name}>
        {minor.name}
      </MenuItem>
    ));
    const courseMenuItems = subjectItems.map((subject, i) => (
      <MenuItem key={i} value={subject.id}>
        {subject.id}
      </MenuItem>
    ));

    const courseItems = courses.map((course, i) => {
      let courseNumber = "courseNumber-" + i;
      let courseId = "courseId-" + i;
      let courseName = "courseName-" + i;

      return (
        <Grid item xs={12} sm={6} md={4} key={i}>
          <Card className="card" elevation={0}>
            <CardContent>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor={courseId}>Course Identifier</InputLabel>
                <Select
                  value={course.courseId}
                  onChange={this.onChange}
                  variant="outlined"
                  name={courseId}
                  id="courseId"
                  MenuProps={{ style: { maxHeight: 300 } }}
                >
                  {courseMenuItems}
                </Select>
              </FormControl>
              <FormControl margin="normal" required maxLength="3" fullWidth>
                <InputLabel htmlFor={courseNumber}>Course Number</InputLabel>
                <Input
                  id="courseNumber"
                  name={courseNumber}
                  value={course.courseNumber}
                  onChange={this.onChange}
                  type="number"
                  inputProps={{ min: 1, step: 1, pattern: "[0-9]", max: 999 }}
                />
              </FormControl>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor={courseName}>Course Name</InputLabel>
                <Input
                  id="courseName"
                  name={courseName}
                  value={course.courseName}
                  onChange={this.onChange}
                />
              </FormControl>
            </CardContent>
            <CardActions>
              <Button
                size="small"
                onClick={(e) => this.removeCourse(course.id)}
              >
                Remove Course
              </Button>
            </CardActions>
          </Card>
        </Grid>
      );
    });

    ///enforcing major & type to be required
    var validProfile = false;
    if (major.length > 0 && type.length > 0) {
      validProfile = true;
    } else {
      validProfile = false;
    }

    //courseId required for each new course
    var validCourseIds = true;
    if (courses.length > 0) {
      for (var c in courses) {
        let C = courses[c];
        if (C.courseId.length > 0) {
          validCourseIds = true;
        } else {
          validCourseIds = false;
        }
      }
    }
    //submit button invalid unless both are satisfied
    var valid = false;
    if (validCourseIds && validProfile) {
      valid = true;
    } else {
      valid = false;
    }

    return (
      <div className="padding20">
        <Typography
          variant="h4"
          component="h1"
          align="center"
          className="editHeading"
        >
          Edit Profile
        </Typography>
        <form onSubmit={this.onSubmit}>
          <Grid container spacing={10}>
            <Grid item xs={12} sm={6} md={6}>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="major">Major(s)</InputLabel>
                <Select
                  multiple
                  value={major}
                  onChange={this.onChange}
                  variant="outlined"
                  MenuProps={{ style: { maxHeight: 300 } }}
                  inputProps={{
                    name: "major",
                    id: "major",
                  }}
                >
                  {majorMenuItems}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <FormControl margin="normal" fullWidth>
                <InputLabel htmlFor="minor">Minor(s)</InputLabel>
                <Select
                  multiple
                  value={minor || []}
                  onChange={this.onChange}
                  MenuProps={{ style: { maxHeight: 300 } }}
                  inputProps={{
                    name: "minor",
                    id: "minor",
                  }}
                >
                  {minorMenuItems}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="type">Paid or volunteer?</InputLabel>
                <Select
                  required
                  value={type || ""}
                  onChange={this.onChange}
                  MenuProps={{ style: { maxHeight: 300 } }}
                  inputProps={{
                    name: "type",
                    id: "type",
                  }}
                >
                  <MenuItem value="" />
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Volunteer">Volunteer</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="bio">Short Bio</InputLabel>
                <textarea
                  id="bio"
                  name="bio"
                  value={bio}
                  rows={4}
                  className="textarea"
                  style={{ marginTop: '48px' }}  // Adjust the top margin as needed
                  onChange={this.onChange}
                />
              </FormControl>
            </Grid>
            <Grid item xs={12}>
            {/*<Typography variant="body1">
              <strong>Availability:</strong> {availability.map(event => `${event.start} to ${event.end}`).join(', ')}
                </Typography>*/}

              {/*<FormControl margin="normal" required fullWidth>
                <InputLabel htmlFor="availability">Availablity</InputLabel>
                <Input
                  type="text"
                  id="availability"
                  name="availability"
                  value={availability}
                  multiline
                  fullWidth
                  onChange={this.onChange}
                />
                </FormControl>*/}
            </Grid>
          </Grid>
          {/* FullCalendar for Availability */}
        <div>
          <h2>Availability Calendar</h2>
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            editable={true}
            eventResizableFromStart={true}
            selectable={true}
            selectMirror={true}
            select={(info) => this.handleSlotSelect(info)}
          />
          <Button
            variant="outlined"
            color="primary"
            onClick={this.handleSaveDates}
            disabled={this.state.events.length === 0}
          >
            Save
          </Button>
        </div>
          <Grid container spacing={10}>
            <Grid item xs={12}>
              <div className="courses" />
            </Grid>
            {courseItems}
            <Grid item xs={12}>
              <Button
                aria-label="Add Course"
                variant="outlined"
                onClick={this.addCourse}
              >
                Add a Course
              </Button>
            </Grid>
          </Grid>
          <Grid container justify-contents="flex-end" spacing={10}>
            <Grid item>
              <Button
                aria-label="Cancel"
                align="right"
                type="cancel"
                className="Button"
                component={Link}
                to="/profile"
              >
                Cancel
              </Button>
            </Grid>
            <Grid item>
              <Button
                align="right"
                type="submit"
                variant="outlined"
                color="inherit"
                className="button"
                disabled={!valid}
              >
                Submit
              </Button>
            </Grid>
          </Grid>
        </form>
      </div>
    );
  }
}

EditProfile.propTypes = {
  createProfile: PropTypes.func.isRequired,
  getCurrentProfile: PropTypes.func.isRequired,
  getSubjects: PropTypes.func.isRequired,
  profile: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  profile: state.profile,
  subjects: state.subjects,
  errors: state.errors,
});

export default connect(
  mapStateToProps,
  { createProfile, getCurrentProfile, getSubjects }
)(withRouter(EditProfile));

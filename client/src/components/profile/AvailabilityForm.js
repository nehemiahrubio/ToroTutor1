import React, { Component } from "react";
import PropTypes from "prop-types";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogTitle from "@material-ui/core/DialogTitle";
import DialogContent from "@material-ui/core/DialogContent";
import DialogActions from "@material-ui/core/DialogActions";
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar';
import moment from "moment";

const localizer = momentLocalizer(moment);

class AvailabilityForm extends Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    events: PropTypes.array.isRequired,
    onSelectSlot: PropTypes.func.isRequired,
  };

  state = {
    selectedSlots: [], // State to store selected slots
  };

  handleSelectSlot = (slotInfo) => {
    // Transform slotInfo into an object with start and end properties
    const selectedSlot = {
      start: slotInfo.start,
      end: slotInfo.end,
    };
  
    // Update selected slots when a new slot is selected
    this.setState((prevState) => ({
      selectedSlots: [...prevState.selectedSlots, selectedSlot],
    }));
  };

  handleSave = () => {
    // Pass the selected slots to the onSave prop
    const { onSave, onClose } = this.props;
    const { selectedSlots } = this.state;
    
    // Call the onSave function with selected slots
    onSave(selectedSlots);

    // Close the dialog
    onClose();
  };

  render() {
    const { isOpen, onClose, events, onSelectSlot } = this.props;

    return (
      <Dialog open={isOpen} onClose={onClose}>
        <DialogTitle>Set Availability</DialogTitle>
        <DialogContent>
          <BigCalendar
            localizer={localizer}
            events={events} // Make sure you have the events array defined or replaced with your actual events
            selectable
            onSelectSlot={onSelectSlot} // This should be correctly passed
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            Cancel
          </Button>
          <Button onClick={this.handleSave} color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

export default AvailabilityForm;

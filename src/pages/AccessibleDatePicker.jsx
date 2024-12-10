
import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const AccessibleDatePicker = ({ selectedDate, onChange, ariaLabel, ...props }) => {
  return (
    <DatePicker
      selected={selectedDate}
      onChange={onChange}
      dateFormat="yyyy-MM-dd"
      placeholderText="Select a date"
      className="dob-input"
      aria-label={ariaLabel}
      aria-required="true"
      {...props}
    />
  );
};

export default AccessibleDatePicker;

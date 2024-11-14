import React, { useState } from 'react';
import { Button, TextField, MenuItem, FormControl, InputLabel, Select } from '@mui/material';

const ScheduleSend = ({ setDelay }) => {
  const [delayValue, setDelayValue] = useState('');
  const [delayUnit, setDelayUnit] = useState('seconds');

  const handleDelayChange = (e) => setDelayValue(e.target.value);
  const handleUnitChange = (e) => setDelayUnit(e.target.value);

  const calculateDelay = () => {
    let delayInMs = parseInt(delayValue) || 0;
    if (delayUnit === 'minutes') delayInMs *= 60 * 1000;
    else if (delayUnit === 'hours') delayInMs *= 60 * 60 * 1000;
    return delayInMs *1000;
  };

  const handleSchedule = () => {
    const delay = calculateDelay();
    console.log(delay);
    setDelay(delay);
    // console.log('delay set');
    // handleSendMessage(delay);
  };

  return (
    <div>
      <TextField
        label="Delay Value"
        type="number"
        value={delayValue}
        onChange={handleDelayChange}
        style={{ marginRight: '10px' }}
      />
      <FormControl>
        <InputLabel>Unit</InputLabel>
        <Select value={delayUnit} onChange={handleUnitChange}>
          <MenuItem value="seconds">Seconds</MenuItem>
          <MenuItem value="minutes">Minutes</MenuItem>
          <MenuItem value="hours">Hours</MenuItem>
        </Select>
      </FormControl>
      <Button onClick={handleSchedule} variant="contained" color="primary" style={{ marginLeft: '10px' }}>
        SCHEDULE SEND
      </Button>
    </div>
  );
};

export default ScheduleSend;

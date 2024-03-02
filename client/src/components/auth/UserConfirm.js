import React, { Component } from "react";
import { Grid } from "@material-ui/core";
import Paper from "@material-ui/core/Paper";
import Card from "@material-ui/core/Card";
import CardMedia from "@material-ui/core/CardMedia";
import ConfirmImg from "../../images/confirmed-text.jpg";
import axios from "axios";

class UserConfirm extends Component {
  componentDidMount = () => {
    const { id } = this.props.match.params;
    axios
      .get(`/email/confirm/${id}`)
      .then((res) => {
        // Handle the response here, if needed
        console.log(res.data);  // Log the response data
      })
      .catch((err) => console.error(err));
  };

  render() {
    return (
      <div className="padding20">
        <Grid container spacing={10} justifyContent="center">
          <Grid item xs={12} sm={8} md={6}>
            <Paper>
              <Card>
                <CardMedia
                  component="img"
                  alt="account confirmed"
                  height="auto"
                  image={ConfirmImg}
                />
              </Card>
            </Paper>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default UserConfirm;
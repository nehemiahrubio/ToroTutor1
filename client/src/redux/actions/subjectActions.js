import axios from "axios";
import { GET_SUBJECTS, SUBJECTS_LOADING, GET_ERRORS } from "./types";

export const createSubjects = (subjectData, history) => (dispatch) => {
  console.log('Creating subjects:', subjectData);

  return axios
    .post("/api/subjects", subjectData)
    .then((res) => {
      console.log('Subjects created successfully:', res.data);
      history.push("/subjects");
    })
    .catch((err) => {
      console.error('Error creating subjects:', err);
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data,
      });
    });
};


// Get all subjects
export const getSubjects = () => (dispatch) => {
  dispatch(setSubjectsLoading());
  axios
    .get("/api/subjects")
    .then((res) => {
      dispatch({
        type: GET_SUBJECTS,
        payload: res.data,
      });
    })
    .catch((err) => {
      dispatch({
        type: GET_ERRORS,
        payload: null,
      });
    });
};

// Delete a subject by ID
export const removeSubject = (subjectId, history) => (dispatch) => {
  return new Promise((resolve, reject) => {
    axios
      .delete("/api/subjects", { data: { id: subjectId } })
      .then((res) => {
        // Dispatch an action to update the state after successful deletion
        dispatch({
          type: GET_SUBJECTS,
          payload: res.data, // Assuming the response contains the updated subjects
        });
        // Optionally, you can dispatch other actions or perform additional logic here
        resolve(res.data); // Resolve the promise with the response data
      })
      .catch((err) => {
        console.log(err);
        reject(err); // Reject the promise with the error
      });
  });
};


// Subjects loading
export const setSubjectsLoading = () => {
  return {
    type: SUBJECTS_LOADING,
  };
};

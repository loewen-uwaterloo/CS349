'use strict';

var ACTIVITY_DATA_ADDED_EVENT = 'ACTIVITY_DATA_ADDED_EVENT';
var ACTIVITY_DATA_REMOVED_EVENT = 'ACTIVITY_DATA_REMOVED_EVENT';

var GRAPH_SELECTED_EVENT = 'GRAPH_SELECTED_EVENT';

var ACTIVITY_TYPE_ADDED_EVENT = 'ACTIVITY_TYPE_ADDED_EVENT';

/**
 * Represents a single activity data point.
 * @param activityType The type of activity. A string
 * @param healthMetricsDict A dictionary of different health metrics. The key is the
 * health data type (e.g., energy level, stress level, etc.), while the value is
 * the value the user gave to that activity.
 * @param activityDurationInMinutes A number
 * @constructor
 */
var ActivityData = function(activityType, healthMetricsDict, activityDurationInMinutes) {
    this.activityType = activityType;
    this.activityDataDict = healthMetricsDict;
    this.activityDurationInMinutes = activityDurationInMinutes
};

/**
 * An object which tracks all of the data
 * @constructor
 */
var ActivityStoreModel = function() {
    this.activityDataPoints = [];
    this.listeners = [];
};

// _ is the Underscore library
// This extends the JavaScript prototype with additional methods
// This is a common idiom for defining JavaScript classes
_.extend(ActivityStoreModel.prototype, {

    /**
     * Add a listener to the listeners we track
     * @param listener The listener is a callback function with the following signature:
     * (eventType, eventTime, activityData) where eventType is a string indicating
     * the event type (one of ACTIVITY_DATA_ADDED_EVENT or ACTIVITY_DATA_REMOVED_EVENT), and
     * activityData the ActivityData added or removed.
     */
    addListener: function(listener) {
        this.listeners.push(listener);
    },

    /**
     * Should remove the given listener.
     * @param listener
     */
    removeListener: function(listener) {
        var index;
        for (index = 0; index < this.listeners.length; ++index)
        {
            if (listener === this.listeners[index])
            {
                this.listeners.splice(index, 1);
                break;
            }
        }
    },

    /**
     * Should add the given data point, and alert listeners that a new data point has
     * been added.
     * @param activityDataPoint
     */
    addActivityDataPoint: function(activityDataPoint) {
        this.activityDataPoints.push(activityDataPoint);
        this.listeners.forEach(function (listener) {
            listener(ACTIVITY_DATA_ADDED_EVENT, new Date(), activityDataPoint);
        });
    },

    /**
     * Should remove the given data point (if it exists), and alert listeners that
     * it was removed. It should not alert listeners if that data point did not
     * exist in the data store
     * @param activityDataPoint
     */
    removeActivityDataPoint: function(activityDataPoint) {
        var index;
        console.log(activityDataPoint);
        for (index = 0; index < this.activityDataPoints.length; ++index)
        {
            if (activityDataPoint === this.activityDataPoints[index])
            {
                this.activityDataPoints.splice(index, 1);

                this.listeners.forEach(function (listener) {
                    listener(ACTIVITY_DATA_REMOVED_EVENT, new Date(), activityDataPoint);
                });
                break;
            }
        }
    },

    /**
     * Should return an array of all activity data points
     */
    getActivityDataPoints: function() {
        return this.activityDataPoints;
    }
});

/**
 * The GraphModel tracks what the currently selected graph is.
 * You should structure your architecture so that when the user chooses
 * a new graph, the event handling code for choosing that graph merely
 * sets the new graph here, in the GraphModel. The graph handling code
 * should then update to show the selected graph, along with any components
 * necessary to configure that graph.
 * @constructor
 */
var GraphModel = function() {
    this.listeners = [];
    this.graphNames = ['table summary', 'scatterplot'];
    this.selectedGraphName = '';
};

_.extend(GraphModel.prototype, {

    /**
     * Add a listener to the listeners we track
     * @param listener The listener is a callback function with the following signature:
     * (eventType, eventTime, eventData) where eventType is a string indicating
     * the event type (specifically, GRAPH_SELECTED_EVENT),
     * and eventData indicates the name of the new graph.
     */
    addListener: function(listener) {
        this.listeners.push(listener);
    },

    /**
     * Should remove the given listener.
     * @param listener
     */
    removeListener: function(listener) {
        var index;
        for (index = 0; index < this.listeners.length; ++index)
        {
            if (listener === this.listeners[index])
            {
                this.listeners.splice(index, 1);
                break;
            }
        }
    },

    /**
     * Returns a list of graphs (strings) that can be selected by the user
     */
    getAvailableGraphNames: function() {
        return this.graphNames;
    },

    /**
     * Should return the name of the currently selected graph. There should
     * *always* be one graph that is currently available.
     */
    getNameOfCurrentlySelectedGraph: function() {
        return this.selectedGraphName;
    },

    /**
     * Changes the currently selected graph to the graph name given. Should
     * broadcast an event to all listeners that the graph changed.
     * @param graphName
     */
    selectGraph: function(graphName) {
        if (this.selectedGraphName != graphName)
        {
            var _this = this;
            _.each(this.graphNames, function (name) {
                if (name === graphName)
                {
                    _this.selectedGraphName = graphName;
                    _this.listeners.forEach(function (listener) {
                        listener(GRAPH_SELECTED_EVENT, new Date(), graphName);
                    });
                }
            });
        }
    }

});

/**
 * Will generate a number of random data points and add them to the model provided.
 * If numDataPointsToGenerate is not provided, will generate and add 100 data points.
 * @param activityModel The model to add data to
 * @param numDataPointsToGenerate The number of points to generate.
 *
 * Example:
 *
 * generateFakeData(new ActivityStoreModel(), 10);
 */
function generateFakeData(activityModel, numDataPointsToGenerate) {
    var fakeActivities = [];
    _.times(
        5,
        function() {
            fakeActivities.push("Activity " + (fakeActivities.length+1));
        }
    );
    numDataPointsToGenerate = (!_.isNumber(numDataPointsToGenerate) || numDataPointsToGenerate < 0) ? 100 : numDataPointsToGenerate;
    _.times(
        numDataPointsToGenerate,
        function() {
            var activityDataPoint = new ActivityData(
                fakeActivities[_.random(fakeActivities.length-1)],
                {
                    energyLevel: _.random(10),
                    stressLevel: _.random(10),
                    happinessLevel: _.random(10)
                },
                _.random(60)
            );
            activityModel.addActivityDataPoint(activityDataPoint);
        }
    );
}

var ActivityTypeModel = function () {
    this.activityTypes = ['Writing Code','Attending Lecture','Video Games','Eating Dinner','Playing Sports','Studying for Exams','Watching TV','Writing a Paper'];
    this.listeners = [];
}

_.extend(ActivityTypeModel.prototype, {

    /**
     * Add a listener to the listeners we track
     * @param listener The listener is a callback function with the following signature:
     * (eventType, eventData) where eventType is a string indicating
     * the event type and eventData indicates the name of the new activity type.
     */
    addListener: function(listener) {
        this.listeners.push(listener);
    },

    /**
     * Should remove the given listener.
     * @param listener
     */
    removeListener: function(listener) {
        var index;
        for (index = 0; index < this.listeners.length; ++index)
        {
            if (listener === this.listeners[index])
            {
                this.listeners.splice(index, 1);
                break;
            }
        }
    },

    getActivityTypes : function () {
       return this.activityTypes;
    },

    addActivityType : function (activityType) {
        _.each(this.activityTypes, function (existingType) {
            if (existingType === activityType)
            {
                return;
            }
        });
        this.activityTypes.push(activityType);
        _.each(this.listeners, function (listenerFunction) {
            listenerFunction(ACTIVITY_TYPE_ADDED_EVENT, activityType);
        })
    }
});



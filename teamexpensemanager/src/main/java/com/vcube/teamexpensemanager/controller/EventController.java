package com.vcube.teamexpensemanager.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.vcube.teamexpensemanager.dto.EventRequest;
import com.vcube.teamexpensemanager.entity.Event;
import com.vcube.teamexpensemanager.service.EventService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/events")
public class EventController {

	@Autowired
	EventService eventService;

	@PostMapping
	ResponseEntity<Event> createEvent(@Valid @RequestBody EventRequest eventReq) {
		return ResponseEntity.status(HttpStatus.CREATED).body(eventService.createEvent(eventReq));
	}

	@GetMapping
	public ResponseEntity<List<Event>> getAllevent() {
		return ResponseEntity.ok(eventService.getAllEvents());
	}

	@GetMapping("/{id}")
	public ResponseEntity<Event> getEvent(@PathVariable Long id) {

		return ResponseEntity.ok(eventService.getEventById(id));
	}

	@PostMapping("/{eventId}/members/{userId}")
	public ResponseEntity<Event> addMember(@PathVariable Long eventId, @PathVariable Long userId) {

		return ResponseEntity.ok(eventService.addMember(eventId, userId));
	}

	@DeleteMapping("/{eventId}/members/{userId}")
	public ResponseEntity<Event> removeMember(@PathVariable Long eventId, @PathVariable Long userId) {

		return ResponseEntity.ok(eventService.removeMember(eventId, userId));
	}

}
